// // features/debug/components/OptionsPanel.tsx
// import React, { useState, useCallback } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@voilajsx/uikit/card';
// import { Button } from '@voilajsx/uikit/button';
// import { Badge } from '@voilajsx/uikit/badge';
// import { Alert, AlertDescription } from '@voilajsx/uikit/alert';
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from '@voilajsx/uikit/collapsible';
// import {
//   Settings,
//   Bug,
//   TestTube,
//   Monitor,
//   Database,
//   CheckCircle,
//   AlertCircle,
//   Loader2,
//   ChevronDown,
//   ChevronRight,
//   Code,
//   Activity,
// } from 'lucide-react';
// import { messaging } from '@voilajsx/comet/messaging';
// import { useCustomer } from '../../shared/hooks/useCustomer';

// // Constants
// const FEEDBACK_DURATION = 3000;

// // Custom hooks
// const useFeedback = () => {
//   const [feedback, setFeedback] = useState(null);
  
//   const showFeedback = useCallback((type, message) => {
//     setFeedback({ type, message });
//     setTimeout(() => setFeedback(null), FEEDBACK_DURATION);
//   }, []);
  
//   return { feedback, showFeedback };
// };

// export default function OptionsPanel(): JSX.Element {
//   const {
//     customers,
//     templates,
//     selectedCustomer,
//     selectedTemplate,
//   } = useCustomer();

//   const { feedback, showFeedback } = useFeedback();

//   // UI State
//   const [isRunningTest, setIsRunningTest] = useState(false);
//   const [testResults, setTestResults] = useState(null);
//   const [showAdvanced, setShowAdvanced] = useState(false);
//   const [showSystemInfo, setShowSystemInfo] = useState(false);

//   // Debug handlers
//   const handleComprehensiveDebug = useCallback(async () => {
//     setIsRunningTest(true);
//     showFeedback('info', 'Running comprehensive debug tests...');
    
//     try {
//       console.log('=== 🏢 COMPREHENSIVE GDMS IFRAME DEBUG ===');
      
//       console.log('👤 BASIC DATA:');
//       console.log('- Selected Customer:', selectedCustomer?.name);
//       console.log('- Customer Data:', selectedCustomer?.originalData);
//       console.log('- Selected Template:', selectedTemplate?.name);
//       console.log('- Field Mapping:', selectedTemplate?.fieldMapping);

//       console.log('📡 TESTING FRAME INJECTION...');
//       let frameTest = null;
//       try {
//         frameTest = await messaging.sendToContent({
//           type: 'comprehensiveFrameTest',
//           data: {}
//         });
//         console.log('✅ Frame test result:', frameTest);
//       } catch (error) {
//         console.error('❌ Frame test failed:', error);
//       }

//       console.log('🖼️ TESTING DIRECT IFRAME ACCESS...');
//       let iframeTest = null;
//       try {
//         iframeTest = await messaging.sendToContent({
//           type: 'testDirectIframeAccess',
//           data: {}
//         });
//         console.log('✅ Direct iframe test:', iframeTest);
//       } catch (error) {
//         console.error('❌ Direct iframe test failed:', error);
//       }

//       let fillTest = null;
//       if (selectedCustomer && selectedTemplate) {
//         console.log('🎯 TESTING FILL SIMULATION...');
//         try {
//           fillTest = await messaging.sendToContent({
//             type: 'simulateIframeFill',
//             data: {
//               customerData: selectedCustomer.originalData || selectedCustomer,
//               fieldMapping: selectedTemplate.fieldMapping
//             }
//           });
//           console.log('✅ Fill simulation result:', fillTest);
//         } catch (error) {
//           console.error('❌ Fill simulation failed:', error);
//         }
//       }

//       const results = {
//         timestamp: new Date().toISOString(),
//         basicData: {
//           hasCustomer: !!selectedCustomer,
//           hasTemplate: !!selectedTemplate,
//           customerName: selectedCustomer?.name || 'None',
//           templateName: selectedTemplate?.name || 'None',
//         },
//         frameTest: frameTest || { success: false, error: 'Test failed' },
//         iframeTest: iframeTest || { success: false, error: 'Test failed' },
//         fillTest: fillTest || { success: false, error: 'No customer/template selected' },
//         summary: {
//           totalTests: 3 + (selectedCustomer && selectedTemplate ? 1 : 0),
//           passedTests: [frameTest?.success, iframeTest?.success, fillTest?.success].filter(Boolean).length,
//         }
//       };

//       setTestResults(results);
//       showFeedback('success', `Debug complete - check console (F12) for details`);
//     } catch (error) {
//       console.error('💥 Debug test failed:', error);
//       showFeedback('error', `Debug failed: ${error.message}`);
//     } finally {
//       setIsRunningTest(false);
//     }
//   }, [selectedCustomer, selectedTemplate, showFeedback]);

//   const handleIframeTest = useCallback(async () => {
//     setIsRunningTest(true);
//     showFeedback('info', 'Testing iframe accessibility...');
    
//     try {
//       const result = await messaging.sendToContent({
//         type: 'comprehensiveIframeTest',
//         data: {}
//       });
      
//       console.log('🖼️ Iframe Test Results:', result);
      
//       if (result.success) {
//         const accessible = result.iframes.filter(i => i.accessible).length;
//         const total = result.iframes.length;
//         showFeedback('success', `Found ${total} iframes, ${accessible} accessible`);
//       } else {
//         showFeedback('error', 'Iframe test failed');
//       }
//     } catch (error) {
//       console.error('❌ Iframe test error:', error);
//       showFeedback('error', `Iframe test failed: ${error.message}`);
//     } finally {
//       setIsRunningTest(false);
//     }
//   }, [showFeedback]);

//   const handleExtractionTest = useCallback(async () => {
//     setIsRunningTest(true);
//     showFeedback('info', 'Testing form field extraction...');
    
//     try {
//       const result = await messaging.sendToContent({
//         type: 'testExtractionReturn',
//         data: {}
//       });
      
//       console.log('🧪 Extraction Test Results:', result);
      
//       if (result.success) {
//         showFeedback('success', 'Extraction test completed - check console');
//       } else {
//         showFeedback('error', 'Extraction test failed');
//       }
//     } catch (error) {
//       console.error('❌ Extraction test error:', error);
//       showFeedback('error', `Extraction test failed: ${error.message}`);
//     } finally {
//       setIsRunningTest(false);
//     }
//   }, [showFeedback]);

//   const handlePageContextTest = useCallback(async () => {
//     setIsRunningTest(true);
//     showFeedback('info', 'Testing page context...');
    
//     try {
//       const result = await messaging.sendToContent({
//         type: 'testPageContext',
//         data: {}
//       });
      
//       console.log('📄 Page Context Results:', result);
      
//       if (result.success) {
//         const ctx = result.context;
//         showFeedback('success', `Page has ${ctx.forms.count} forms, ${ctx.fields.inputs} inputs, ${ctx.iframes.count} iframes`);
//       } else {
//         showFeedback('error', 'Page context test failed');
//       }
//     } catch (error) {
//       console.error('❌ Page context test error:', error);
//       showFeedback('error', `Page context test failed: ${error.message}`);
//     } finally {
//       setIsRunningTest(false);
//     }
//   }, [showFeedback]);

//   const handleClearConsole = useCallback(() => {
//     console.clear();
//     showFeedback('success', 'Console cleared');
//   }, [showFeedback]);

//   const getSystemInfo = useCallback(() => {
//     return {
//       browser: {
//         userAgent: navigator.userAgent,
//         language: navigator.language,
//         cookieEnabled: navigator.cookieEnabled,
//         onLine: navigator.onLine,
//       },
//       page: {
//         url: window.location.href,
//         title: document.title,
//         domain: window.location.hostname,
//         protocol: window.location.protocol,
//         readyState: document.readyState,
//       },
//       storage: {
//         localStorage: typeof localStorage !== 'undefined',
//         sessionStorage: typeof sessionStorage !== 'undefined',
//         indexedDB: typeof indexedDB !== 'undefined',
//       },
//       capabilities: {
//         fetch: typeof fetch !== 'undefined',
//         promises: typeof Promise !== 'undefined',
//         webWorkers: typeof Worker !== 'undefined',
//         serviceWorkers: 'serviceWorker' in navigator,
//       },
//       data: {
//         customers: customers.length,
//         templates: templates.length,
//         selectedCustomer: selectedCustomer?.name || 'None',
//         selectedTemplate: selectedTemplate?.name || 'None',
//       }
//     };
//   }, [customers, templates, selectedCustomer, selectedTemplate]);

//   const systemInfo = getSystemInfo();

//   return (
//     <div className="max-w-4xl mx-auto space-y-4 p-4">
//       {/* Header */}
//       <div className="text-center space-y-1">
//         <h1 className="text-xl font-bold">Debug Tools</h1>
//         <p className="text-sm text-muted-foreground">
//           Developer tools for debugging form filling and iframe access
//         </p>
//       </div>

//       {/* Feedback */}
//       {feedback && (
//         <Alert variant={feedback.type === 'success' ? 'default' : feedback.type === 'error' ? 'destructive' : 'default'}>
//           {feedback.type === 'success' ? (
//             <CheckCircle className="h-4 w-4" />
//           ) : feedback.type === 'error' ? (
//             <AlertCircle className="h-4 w-4" />
//           ) : (
//             <Activity className="h-4 w-4" />
//           )}
//           <AlertDescription>{feedback.message}</AlertDescription>
//         </Alert>
//       )}

//       {/* Test Results */}
//       {testResults && (
//         <Card className="border-green-200 bg-green-50">
//           <CardHeader>
//             <CardTitle className="text-lg text-green-800">Latest Test Results</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span>Timestamp:</span>
//                 <span className="font-mono text-xs">{testResults.timestamp}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Tests Passed:</span>
//                 <Badge variant="outline">
//                   {testResults.summary.passedTests}/{testResults.summary.totalTests}
//                 </Badge>
//               </div>
//               <div className="flex justify-between">
//                 <span>Customer:</span>
//                 <span>{testResults.basicData.customerName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Template:</span>
//                 <span>{testResults.basicData.templateName}</span>
//               </div>
//               <div className="pt-2 text-xs text-green-600">
//                 See browser console (F12) for detailed results
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Main Debug Tests */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-lg">
//             <Bug className="w-5 h-5" />
//             Debug Tests
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <Button
//               onClick={handleComprehensiveDebug}
//               disabled={isRunningTest}
//               variant="default"
//               className="h-20 flex-col"
//             >
//               {isRunningTest ? (
//                 <Loader2 className="w-5 h-5 mb-1 animate-spin" />
//               ) : (
//                 <TestTube className="w-5 h-5 mb-1" />
//               )}
//               <span className="text-sm">Comprehensive Debug</span>
//               <span className="text-xs text-muted-foreground">Full system test</span>
//             </Button>

//             <Button
//               onClick={handleIframeTest}
//               disabled={isRunningTest}
//               variant="outline"
//               className="h-20 flex-col"
//             >
//               {isRunningTest ? (
//                 <Loader2 className="w-5 h-5 mb-1 animate-spin" />
//               ) : (
//                 <Monitor className="w-5 h-5 mb-1" />
//               )}
//               <span className="text-sm">Iframe Test</span>
//               <span className="text-xs text-muted-foreground">Check iframe access</span>
//             </Button>

//             <Button
//               onClick={handleExtractionTest}
//               disabled={isRunningTest}
//               variant="outline"
//               className="h-20 flex-col"
//             >
//               {isRunningTest ? (
//                 <Loader2 className="w-5 h-5 mb-1 animate-spin" />
//               ) : (
//                 <Code className="w-5 h-5 mb-1" />
//               )}
//               <span className="text-sm">Extraction Test</span>
//               <span className="text-xs text-muted-foreground">Test field detection</span>
//             </Button>

//             <Button
//               onClick={handlePageContextTest}
//               disabled={isRunningTest}
//               variant="outline"
//               className="h-20 flex-col"
//             >
//               {isRunningTest ? (
//                 <Loader2 className="w-5 h-5 mb-1 animate-spin" />
//               ) : (
//                 <Database className="w-5 h-5 mb-1" />
//               )}
//               <span className="text-sm">Page Context</span>
//               <span className="text-xs text-muted-foreground">Analyze current page</span>
//             </Button>
//           </div>

//           <div className="pt-3 border-t">
//             <Button
//               onClick={handleClearConsole}
//               variant="ghost"
//               size="sm"
//               className="w-full"
//             >
//               Clear Console
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* System Information */}
//       <Collapsible open={showSystemInfo} onOpenChange={setShowSystemInfo}>
//         <CollapsibleTrigger asChild>
//           <Button variant="ghost" className="w-full justify-between text-sm">
//             <span className="flex items-center gap-2">
//               <Settings className="w-4 h-4" />
//               System Information
//             </span>
//             {showSystemInfo ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//           </Button>
//         </CollapsibleTrigger>
//         <CollapsibleContent>
//           <Card>
//             <CardContent className="pt-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <h4 className="font-medium mb-2">Browser</h4>
//                   <div className="text-xs space-y-1 text-muted-foreground">
//                     <div>Language: {systemInfo.browser.language}</div>
//                     <div>Online: {systemInfo.browser.onLine ? 'Yes' : 'No'}</div>
//                     <div>Cookies: {systemInfo.browser.cookieEnabled ? 'Enabled' : 'Disabled'}</div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h4 className="font-medium mb-2">Page</h4>
//                   <div className="text-xs space-y-1 text-muted-foreground">
//                     <div>Domain: {systemInfo.page.domain}</div>
//                     <div>Protocol: {systemInfo.page.protocol}</div>
//                     <div>State: {systemInfo.page.readyState}</div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h4 className="font-medium mb-2">Storage</h4>
//                   <div className="text-xs space-y-1 text-muted-foreground">
//                     <div>localStorage: {systemInfo.storage.localStorage ? 'Available' : 'Not available'}</div>
//                     <div>sessionStorage: {systemInfo.storage.sessionStorage ? 'Available' : 'Not available'}</div>
//                     <div>IndexedDB: {systemInfo.storage.indexedDB ? 'Available' : 'Not available'}</div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <h4 className="font-medium mb-2">Data</h4>
//                   <div className="text-xs space-y-1 text-muted-foreground">
//                     <div>Customers: {systemInfo.data.customers}</div>
//                     <div>Templates: {systemInfo.data.templates}</div>
//                     <div>Selected Customer: {systemInfo.data.selectedCustomer}</div>
//                     <div>Selected Template: {systemInfo.data.selectedTemplate}</div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </CollapsibleContent>
//       </Collapsible>

//       {/* Advanced Debug Options */}
//       <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
//         <CollapsibleTrigger asChild>
//           <Button variant="ghost" className="w-full justify-between text-sm">
//             <span className="flex items-center gap-2">
//               <Settings className="w-4 h-4" />
//               Advanced Debug Options
//             </span>
//             {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//           </Button>
//         </CollapsibleTrigger>
//         <CollapsibleContent>
//           <Card>
//             <CardContent className="pt-4">
//               <div className="text-sm text-muted-foreground space-y-2">
//                 <div>• All debug output goes to browser console (F12)</div>
//                 <div>• Tests are safe and don't modify any data</div>
//                 <div>• Comprehensive Debug runs all tests in sequence</div>
//                 <div>• Individual tests focus on specific functionality</div>
//                 <div>• Use Page Context to understand current page structure</div>
//               </div>
              
//               <div className="pt-3 border-t mt-3">
//                 <Button
//                   onClick={() => {
//                     console.log('=== MANUAL DEBUG SESSION ===');
//                     console.log('System Info:', systemInfo);
//                     console.log('Available for manual testing...');
//                     showFeedback('info', 'Manual debug session started - check console');
//                   }}
//                   variant="ghost"
//                   size="sm"
//                   className="w-full"
//                 >
//                   Start Manual Debug Session
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </CollapsibleContent>
//       </Collapsible>

//       {/* Developer Notes */}
//       <Card className="border-yellow-200 bg-yellow-50">
//         <CardContent className="pt-4">
//           <div className="text-center space-y-2">
//             <h3 className="font-medium text-yellow-900">Developer Notes</h3>
//             <div className="text-sm text-yellow-700 space-y-1">
//               <div>• Open browser console (F12) to see detailed debug information</div>
//               <div>• Tests are designed to be safe and non-destructive</div>
//               <div>• Use different tests to isolate specific issues</div>
//               <div>• System Information shows current browser and extension state</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }