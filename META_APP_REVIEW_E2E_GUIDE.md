# Meta App Review - E2E Testing Guide

## 📋 Overview
This document provides comprehensive End-to-End (E2E) testing instructions for Meta App Review Team to verify our Facebook application's compliance with Meta Platform Policy requirements.

## 🔍 Key Review Requirements
Our application requests the following permissions:
- **ads_read**: Read advertising data for analysis
- **ads_management**: Access detailed advertising account information

## 🎯 Critical Testing Points

### 1. Privacy Policy Visibility Test
**✅ REQUIREMENT**: Privacy policy MUST be visible in Facebook OAuth dialog

**📱 Testing Steps**:
1. Visit test page: `https://eccal.thinkwithblack.com/facebook-test-demo`
2. Click "Connect Facebook" button
3. **VERIFY**: Privacy policy link appears in Facebook OAuth dialog
4. **VERIFY**: Privacy policy URL is accessible: `https://thinkwithblack.com/privacy`
5. **VERIFY**: Privacy policy link is clickable during OAuth process

### 2. Permission Usage Demonstration
**✅ REQUIREMENT**: Show how ads_read and ads_management permissions are used

**📱 Testing Steps**:
1. Complete Facebook OAuth authorization
2. Select a Facebook ad account
3. Start health check process
4. **VERIFY**: Application reads advertising data (campaigns, metrics, performance)
5. **VERIFY**: Application generates AI-powered analysis reports
6. **VERIFY**: No data modification occurs (READ-ONLY operations)

### 3. Data Deletion Endpoint
**✅ REQUIREMENT**: Provide data deletion capability for users

**📱 Testing Steps**:
1. Send POST request to: `https://eccal.thinkwithblack.com/api/facebook/data-deletion`
2. **VERIFY**: Endpoint responds with confirmation
3. **VERIFY**: User data deletion process is acknowledged

## 🛠️ Technical Implementation Details

### Facebook OAuth Configuration
- **App ID**: 1087313456009870
- **OAuth Endpoint**: `/api/diagnosis/facebook-auth-url`
- **Callback Endpoint**: `/api/diagnosis/facebook-callback`
- **Scope**: `ads_read,ads_management`
- **Auth Type**: `rerequest` (ensures privacy policy display)

### Privacy Policy Integration
- **URL**: https://thinkwithblack.com/privacy
- **Display**: Automatically shown in Facebook OAuth dialog
- **Compliance**: Meets Meta Platform Policy Section 4.a requirements

### Permission Usage Examples
1. **ads_read Usage**:
   - Read advertising account list
   - Retrieve campaign performance data
   - Analyze click-through rates (CTR)
   - Calculate Return on Ad Spend (ROAS)

2. **ads_management Usage**:
   - Access detailed account information
   - Read ad groups and creative materials
   - Analyze advertising placement settings
   - Generate optimization recommendations

## 📊 Testing Checklist

### Pre-Testing Setup
- [ ] Verify Facebook App ID configuration
- [ ] Confirm privacy policy accessibility
- [ ] Check data deletion endpoint functionality

### E2E Testing Process
- [ ] **Step 1**: Access test page
- [ ] **Step 2**: Complete Google authentication (required for user identity)
- [ ] **Step 3**: Start Facebook OAuth process
- [ ] **Step 4**: **CRITICAL** - Verify privacy policy display in OAuth dialog
- [ ] **Step 5**: Grant permissions (ads_read, ads_management)
- [ ] **Step 6**: Select Facebook ad account
- [ ] **Step 7**: Execute health check analysis
- [ ] **Step 8**: Review AI-generated recommendations
- [ ] **Step 9**: Verify data deletion endpoint

### Post-Testing Validation
- [ ] Confirm privacy policy was accessible during OAuth
- [ ] Verify permission usage was demonstrated
- [ ] Check data deletion endpoint response
- [ ] Validate no data modification occurred

## 📞 Support Information

**Contact**: backtrue@thinkwithblack.com
**App ID**: 1087313456009870
**Test Page**: https://eccal.thinkwithblack.com/facebook-test-demo
**Privacy Policy**: https://thinkwithblack.com/privacy
**Data Deletion**: https://eccal.thinkwithblack.com/api/facebook/data-deletion

## 📄 Compliance Documentation

### Meta Platform Policy Requirements
- ✅ Privacy policy clearly displayed during OAuth process
- ✅ Data usage explained in privacy policy
- ✅ User consent obtained before data access
- ✅ Data deletion mechanism provided
- ✅ Only READ operations performed on advertising data

### Data Protection Measures
- ✅ No permanent storage of Facebook user data
- ✅ Token-based authentication for secure access
- ✅ HTTPS encryption for all communications
- ✅ Comprehensive error handling and logging

## 🎬 E2E Testing Video Guide

For a complete demonstration of the E2E testing process, please follow these recording guidelines:

1. **Start Recording**: Begin screen recording before accessing the test page
2. **Navigate to Test Page**: Visit https://eccal.thinkwithblack.com/facebook-test-demo
3. **Authentication Flow**: Show complete Google + Facebook authentication process
4. **Privacy Policy Focus**: Highlight privacy policy visibility in Facebook OAuth dialog
5. **Permission Usage**: Demonstrate actual usage of ads_read and ads_management permissions
6. **Data Analysis**: Show health check analysis and AI recommendations
7. **Data Deletion**: Test the data deletion endpoint functionality

### Video Requirements
- **Duration**: 3-5 minutes complete E2E flow
- **Quality**: HD screen recording with clear UI visibility
- **Audio**: Optional narration explaining each step
- **Focus**: Emphasize privacy policy visibility and permission usage

## 📋 Meta Reviewer Action Items

1. **Privacy Policy Verification**: Confirm privacy policy appears in Facebook OAuth dialog
2. **Permission Usage Validation**: Verify ads_read and ads_management are used appropriately
3. **Data Deletion Testing**: Test data deletion endpoint functionality
4. **E2E Flow Completion**: Complete entire testing process from start to finish
5. **Documentation Review**: Review this guide and privacy policy for compliance

---

**Last Updated**: July 15, 2025
**Version**: 1.0
**App Status**: Under Review