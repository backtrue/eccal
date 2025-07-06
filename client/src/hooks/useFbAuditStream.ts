import { useState, useCallback } from 'react';

interface StreamingState {
  status: 'idle' | 'loading' | 'complete' | 'error';
  message: string;
  comparisons: any[];
  finalData?: any;
  error?: string;
  generatingMetrics: Set<string>;
}

export function useFbAuditStream() {
  const [state, setState] = useState<StreamingState>({
    status: 'idle',
    message: '',
    comparisons: [],
    generatingMetrics: new Set()
  });

  const startStreamingHealthCheck = useCallback(async (
    adAccountId: string,
    planResultId: string,
    industryType: string
  ) => {
    setState({
      status: 'loading',
      message: '開始健檢...',
      comparisons: [],
      generatingMetrics: new Set()
    });

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/fbaudit/check-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adAccountId,
          planResultId,
          industryType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'status':
                  setState(prev => ({
                    ...prev,
                    message: data.message
                  }));
                  break;

                case 'comparisons':
                  setState(prev => ({
                    ...prev,
                    comparisons: data.data,
                    message: '基本比較完成，開始生成 AI 建議...'
                  }));
                  break;

                case 'generating':
                  setState(prev => ({
                    ...prev,
                    message: data.message,
                    generatingMetrics: new Set([...prev.generatingMetrics, data.metric])
                  }));
                  break;

                case 'advice_complete':
                  setState(prev => {
                    const updatedComparisons = prev.comparisons.map(comp => 
                      comp.metric === data.metric 
                        ? { ...comp, advice: data.advice }
                        : comp
                    );
                    const newGeneratingMetrics = new Set(prev.generatingMetrics);
                    newGeneratingMetrics.delete(data.metric);
                    
                    return {
                      ...prev,
                      comparisons: updatedComparisons,
                      generatingMetrics: newGeneratingMetrics,
                      message: `${data.metric} AI 建議完成`
                    };
                  });
                  break;

                case 'complete':
                  setState(prev => ({
                    ...prev,
                    status: 'complete',
                    message: '健檢完成！',
                    finalData: data.data,
                    generatingMetrics: new Set()
                  }));
                  break;

                case 'error':
                  setState(prev => ({
                    ...prev,
                    status: 'error',
                    error: data.error
                  }));
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      message: '',
      comparisons: [],
      generatingMetrics: new Set()
    });
  }, []);

  return {
    ...state,
    startStreamingHealthCheck,
    reset
  };
}