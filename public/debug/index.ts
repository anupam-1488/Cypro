// features/debug/index.ts
import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'debug',

  ui: {
    options: {
      panel: {
        label: 'Debug Tools',
        icon: 'Settings',
        section: 'developer',
        order: 3,
      },
      component: () => import('./components/OptionsPanel'),
    },
  },

  handlers: {
    /**
     * Test extraction return value
     */
    testExtractionReturn: () => {
      console.log('🧪 Testing extraction return value...');
      
      try {
        // Import the extractFormFields handler from ai-scan feature
        // This is a simplified test - in practice you'd import it properly
        const result = {
          fields: [],
          success: true,
          mockTest: true
        };
        
        console.log('✅ Extraction result:', {
          type: typeof result,
          hasFields: !!(result && result.fields),
          fieldCount: result && result.fields ? result.fields.length : 0,
          success: result ? result.success : false
        });
        
        if (result && result.fields && result.fields.length > 0) {
          console.log('📝 First 3 fields:', result.fields.slice(0, 3));
        }
        
        return { success: true, result };
      } catch (error) {
        console.error('❌ Test failed:', error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Comprehensive iframe test
     */
    comprehensiveIframeTest: () => {
      console.log('🖼️ Testing iframe access...');
      
      const iframes = document.querySelectorAll('iframe');
      const results = [];
      
      iframes.forEach((iframe, index) => {
        const result = {
          index,
          id: iframe.id || 'no-id',
          name: iframe.name || 'no-name',
          src: iframe.src || 'no-src',
          accessible: false,
          inputCount: 0,
          selectCount: 0,
          textareaCount: 0
        };
        
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            result.accessible = true;
            result.inputCount = doc.querySelectorAll('input').length;
            result.selectCount = doc.querySelectorAll('select').length;
            result.textareaCount = doc.querySelectorAll('textarea').length;
          }
        } catch (error) {
          result.error = error.message;
        }
        
        results.push(result);
        console.log(`Iframe ${index}:`, result);
      });
      
      return { success: true, iframes: results };
    },

    /**
     * Test direct iframe access
     */
    testDirectIframeAccess: () => {
      console.log('🖼️ Testing direct iframe access...');
      
      const iframes = document.querySelectorAll('iframe');
      const results = [];
      
      iframes.forEach((iframe, index) => {
        const result = {
          index,
          id: iframe.id || 'no-id',
          name: iframe.name || 'no-name',
          src: iframe.src || 'no-src',
          accessible: false,
          errors: []
        };
        
        try {
          // Try different access methods
          let doc = null;
          
          // Method 1: contentDocument
          try {
            doc = iframe.contentDocument;
            if (doc) {
              result.accessible = true;
              result.accessMethod = 'contentDocument';
            }
          } catch (error) {
            result.errors.push(`contentDocument: ${error.message}`);
          }
          
          // Method 2: contentWindow.document
          if (!doc) {
            try {
              doc = iframe.contentWindow?.document;
              if (doc) {
                result.accessible = true;
                result.accessMethod = 'contentWindow.document';
              }
            } catch (error) {
              result.errors.push(`contentWindow.document: ${error.message}`);
            }
          }
          
          if (doc) {
            result.title = doc.title || 'no-title';
            result.url = doc.URL || 'no-url';
            result.readyState = doc.readyState || 'unknown';
            result.formCount = doc.forms?.length || 0;
            result.inputCount = doc.querySelectorAll('input')?.length || 0;
            result.selectCount = doc.querySelectorAll('select')?.length || 0;
            result.textareaCount = doc.querySelectorAll('textarea')?.length || 0;
          }
          
        } catch (error) {
          result.errors.push(`General error: ${error.message}`);
        }
        
        results.push(result);
        console.log(`Direct iframe test ${index}:`, result);
      });
      
      return { 
        success: true, 
        totalIframes: iframes.length,
        accessibleIframes: results.filter(r => r.accessible).length,
        results 
      };
    },

    /**
     * Simulate iframe fill operation
     */
    simulateIframeFill: (data: { 
      customerData: Record<string, any>; 
      fieldMapping: Record<string, string | string[]> 
    }) => {
      console.log('🎯 Simulating iframe fill operation...');
      
      const { customerData, fieldMapping } = data;
      const results = [];
      
      if (!customerData || !fieldMapping) {
        return { 
          success: false, 
          error: 'Missing customer data or field mapping',
          results: []
        };
      }
      
      console.log('Customer data keys:', Object.keys(customerData));
      console.log('Field mapping:', fieldMapping);
      
      // Simulate filling each mapped field
      Object.entries(fieldMapping).forEach(([fieldName, selectors]) => {
        const customerValue = customerData[fieldName];
        const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
        
        selectorArray.forEach(selector => {
          const simulation = {
            fieldName,
            selector,
            customerValue,
            simulated: true,
            found: false,
            accessible: false,
            filled: false,
            context: 'unknown'
          };
          
          try {
            // Check if this is an iframe selector
            const iframeMatch = selector.match(/^(#[\w-]+|iframe\[name="[^"]+"\]|iframe:nth-of-type\(\d+\))\s+(.+)$/);
            
            if (iframeMatch) {
              const [, iframeSelector, innerSelector] = iframeMatch;
              
              try {
                const iframe = document.querySelector(iframeSelector);
                if (iframe) {
                  simulation.context = `iframe-${iframe.id || iframe.name || 'unknown'}`;
                  simulation.found = true;
                  
                  try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                      simulation.accessible = true;
                      
                      const elements = iframeDoc.querySelectorAll(innerSelector);
                      if (elements.length > 0) {
                        simulation.elementCount = elements.length;
                        simulation.filled = true; // Would be filled in real scenario
                      }
                    }
                  } catch (error) {
                    simulation.error = `Iframe access error: ${error.message}`;
                  }
                }
              } catch (error) {
                simulation.error = `Iframe selector error: ${error.message}`;
              }
            } else {
              // Main document selector
              simulation.context = 'main';
              
              try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                  simulation.found = true;
                  simulation.accessible = true;
                  simulation.elementCount = elements.length;
                  simulation.filled = true; // Would be filled in real scenario
                }
              } catch (error) {
                simulation.error = `Selector error: ${error.message}`;
              }
            }
          } catch (error) {
            simulation.error = `General error: ${error.message}`;
          }
          
          results.push(simulation);
          console.log('Simulation result:', simulation);
        });
      });
      
      const successfulFills = results.filter(r => r.filled).length;
      const totalAttempts = results.length;
      
      console.log(`Simulation complete: ${successfulFills}/${totalAttempts} fields would be filled`);
      
      return {
        success: true,
        simulatedFills: successfulFills,
        totalAttempts,
        results,
        customerDataFields: Object.keys(customerData),
        mappingFields: Object.keys(fieldMapping)
      };
    },

    /**
     * Comprehensive frame test
     */
    comprehensiveFrameTest: () => {
      console.log('🏢 === COMPREHENSIVE GDMS IFRAME DEBUG ===');
      
      const results = {
        pageInfo: {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname,
          timestamp: Date.now()
        },
        iframes: [],
        summary: {
          totalIframes: 0,
          accessibleIframes: 0,
          iframesWithForms: 0,
          totalFormFields: 0
        }
      };
      
      try {
        const iframes = document.querySelectorAll('iframe');
        results.summary.totalIframes = iframes.length;
        
        console.log(`Found ${iframes.length} iframes on page`);
        
        iframes.forEach((iframe, index) => {
          const iframeResult = {
            index,
            id: iframe.id || '',
            name: iframe.name || '',
            src: iframe.src || '',
            className: iframe.className || '',
            accessible: false,
            crossOrigin: false,
            formData: {
              forms: 0,
              inputs: 0,
              selects: 0,
              textareas: 0,
              totalFields: 0
            },
            errors: []
          };
          
          try {
            // Try to access iframe document
            let doc = null;
            
            try {
              doc = iframe.contentDocument || iframe.contentWindow?.document;
            } catch (error) {
              iframeResult.crossOrigin = true;
              iframeResult.errors.push(`Cross-origin access denied: ${error.message}`);
            }
            
            if (doc) {
              iframeResult.accessible = true;
              results.summary.accessibleIframes++;
              
              // Get form data
              try {
                const forms = doc.forms || [];
                const inputs = doc.querySelectorAll('input') || [];
                const selects = doc.querySelectorAll('select') || [];
                const textareas = doc.querySelectorAll('textarea') || [];
                
                iframeResult.formData = {
                  forms: forms.length,
                  inputs: inputs.length,
                  selects: selects.length,
                  textareas: textareas.length,
                  totalFields: inputs.length + selects.length + textareas.length
                };
                
                results.summary.totalFormFields += iframeResult.formData.totalFields;
                
                if (forms.length > 0) {
                  results.summary.iframesWithForms++;
                }
                
                // Additional iframe info
                iframeResult.title = doc.title || '';
                iframeResult.url = doc.URL || '';
                iframeResult.readyState = doc.readyState || '';
                
              } catch (error) {
                iframeResult.errors.push(`Form data extraction error: ${error.message}`);
              }
            }
            
          } catch (error) {
            iframeResult.errors.push(`General iframe error: ${error.message}`);
          }
          
          results.iframes.push(iframeResult);
          
          console.log(`Iframe ${index} (${iframeResult.id || 'no-id'}):`, {
            accessible: iframeResult.accessible,
            formFields: iframeResult.formData.totalFields,
            errors: iframeResult.errors.length
          });
        });
        
        console.log('=== COMPREHENSIVE TEST SUMMARY ===');
        console.log(`Total iframes: ${results.summary.totalIframes}`);
        console.log(`Accessible iframes: ${results.summary.accessibleIframes}`);
        console.log(`Iframes with forms: ${results.summary.iframesWithForms}`);
        console.log(`Total form fields across all iframes: ${results.summary.totalFormFields}`);
        
        return {
          success: true,
          ...results
        };
        
      } catch (error) {
        console.error('Comprehensive frame test failed:', error);
        return {
          success: false,
          error: error.message,
          results
        };
      }
    },

    /**
     * Test page context and capabilities
     */
    testPageContext: () => {
      console.log('📄 Testing page context and capabilities...');
      
      const context = {
        page: {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname,
          protocol: window.location.protocol,
          readyState: document.readyState
        },
        forms: {
          count: document.forms.length,
          details: Array.from(document.forms).map((form, index) => ({
            index,
            name: form.name || '',
            id: form.id || '',
            method: form.method || '',
            action: form.action || '',
            fieldCount: form.elements.length
          }))
        },
        fields: {
          inputs: document.querySelectorAll('input').length,
          selects: document.querySelectorAll('select').length,
          textareas: document.querySelectorAll('textarea').length
        },
        iframes: {
          count: document.querySelectorAll('iframe').length,
          accessible: 0
        },
        capabilities: {
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          indexedDB: typeof indexedDB !== 'undefined',
          fetch: typeof fetch !== 'undefined',
          promises: typeof Promise !== 'undefined'
        }
      };
      
      // Test iframe accessibility
      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            context.iframes.accessible++;
          }
        } catch (error) {
          // Ignore cross-origin errors
        }
      });
      
      console.log('Page context:', context);
      
      return {
        success: true,
        context
      };
    }
  },

  init: () => console.log('[Debug] Feature loaded successfully'),
};

export default config;