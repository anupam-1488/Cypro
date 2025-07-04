// features/aisuggest-autofill/index.ts
import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'aisuggest-autofill',

  ui: {
    popup: {
      tab: {
        label: 'AutoFill',
        icon: 'Zap',
        order: 1,
        requiresTab: true,
      },
      component: () => import('./components/PopupTab'),
    },
    options: {
      panel: {
        label: 'Customer Data',
        icon: 'Users',
        section: 'features',
        order: 1,
      },
      component: () => import('./components/OptionsPanel'),
    },
  },

  handlers: {
    /**
     * COMPREHENSIVE FORM FILLING
     * Fills all types of form fields with customer data
     */
    fillFormWithMapping: (data: { 
      customerData: Record<string, any>; 
      fieldMapping: Record<string, string | string[]> 
    }) => {
      const { customerData, fieldMapping } = data;
      let filledCount = 0;
      const results = [];
      
      console.log('[FillForm] Starting comprehensive form filling...');
      console.log('[FillForm] Customer data:', customerData);
      console.log('[FillForm] Field mapping:', fieldMapping);

      /**
       * Get customer value with fallback
       */
      const getCustomerValue = (fieldName) => {
        let value = customerData[fieldName];
        
        if ((value === undefined || value === null || value === '') && customerData) {
          const lowerFieldName = fieldName.toLowerCase();
          const matchingKey = Object.keys(customerData).find(key => 
            key.toLowerCase() === lowerFieldName
          );
          if (matchingKey) {
            value = customerData[matchingKey];
          }
        }
        
        return (value !== undefined && value !== null && value !== '') 
          ? String(value) 
          : null;
      };

      /**
       * Fill text input or textarea
       */
      const fillTextElement = (element, value, context) => {
        try {
          element.focus();
          element.value = value;
          
          // Trigger events for framework compatibility
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new Event('blur', { bubbles: true }));
          
          console.log(`[FillForm] ✅ Filled text field in ${context}: "${value}"`);
          return true;
        } catch (error) {
          console.error(`[FillForm] Error filling text element:`, error);
          return false;
        }
      };

      /**
       * Fill select element
       */
      const fillSelectElement = (element, value, context) => {
        try {
          console.log(`[FillForm] Filling select in ${context} with: "${value}"`);
          
          let optionFound = false;
          
          // Strategy 1: Match by value
          for (let i = 0; i < element.options.length; i++) {
            if (element.options[i].value === value) {
              element.selectedIndex = i;
              optionFound = true;
              break;
            }
          }
          
          // Strategy 2: Match by text content
          if (!optionFound) {
            const lowerValue = value.toLowerCase();
            for (let i = 0; i < element.options.length; i++) {
              const optionText = element.options[i].textContent?.trim().toLowerCase() || '';
              if (optionText === lowerValue || optionText.includes(lowerValue)) {
                element.selectedIndex = i;
                optionFound = true;
                break;
              }
            }
          }
          
          if (optionFound) {
            element.focus();
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
            console.log(`[FillForm] ✅ Selected option in ${context}`);
            return true;
          } else {
            console.warn(`[FillForm] ❌ No matching option for: "${value}"`);
            return false;
          }
        } catch (error) {
          console.error(`[FillForm] Error filling select:`, error);
          return false;
        }
      };

      /**
       * Fill radio button group
       */
      const fillRadioElement = (element, value, context) => {
        try {
          const groupName = element.name;
          if (!groupName) return false;
          
          const doc = element.ownerDocument || document;
          const radioGroup = Array.from(doc.querySelectorAll(`input[type="radio"][name="${groupName}"]`));
          
          for (const radio of radioGroup) {
            if (radio.value === value) {
              radio.checked = true;
              radio.focus();
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`[FillForm] ✅ Selected radio in ${context}: "${value}"`);
              return true;
            }
          }
          
          console.warn(`[FillForm] ❌ No matching radio option for: "${value}"`);
          return false;
        } catch (error) {
          console.error(`[FillForm] Error filling radio:`, error);
          return false;
        }
      };

      /**
       * Fill checkbox element
       */
      const fillCheckboxElement = (element, value, context) => {
        try {
          const shouldCheck = ['true', '1', 'yes', 'on', 'checked'].includes(value.toLowerCase()) || 
                             element.value === value;
          
          element.checked = shouldCheck;
          element.focus();
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new Event('blur', { bubbles: true }));
          
          console.log(`[FillForm] ✅ Set checkbox in ${context} to ${shouldCheck ? 'checked' : 'unchecked'}`);
          return true;
        } catch (error) {
          console.error(`[FillForm] Error filling checkbox:`, error);
          return false;
        }
      };

      /**
       * Fill element based on type
       */
      const fillElement = (element, value, context) => {
        const tagName = element.tagName.toLowerCase();
        const inputType = element.type?.toLowerCase();
        
        if (tagName === 'select') {
          return fillSelectElement(element, value, context);
        } else if (tagName === 'input') {
          switch (inputType) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
            case 'search':
            case 'password':
            case 'number':
              return fillTextElement(element, value, context);
            case 'radio':
              return fillRadioElement(element, value, context);
            case 'checkbox':
              return fillCheckboxElement(element, value, context);
            default:
              console.warn(`[FillForm] Unsupported input type: ${inputType}`);
              return false;
          }
        } else if (tagName === 'textarea') {
          return fillTextElement(element, value, context);
        }
        
        return false;
      };

      /**
       * Find elements with selector (supports iframes)
       */
      const findElementsWithSelector = (selector) => {
        const results = [];
        
        // Check if this is an iframe selector
        const iframeMatch = selector.match(/^(#[\w-]+|iframe\[name="[^"]+"\]|iframe:nth-of-type\(\d+\))\s+(.+)$/);
        
        if (iframeMatch) {
          const [, iframeSelector, innerSelector] = iframeMatch;
          
          try {
            const iframe = document.querySelector(iframeSelector);
            if (iframe) {
              let iframeDoc = null;
              try {
                iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              } catch (error) {
                console.warn(`[FillForm] Cannot access iframe: ${error.message}`);
                return results;
              }
              
              if (iframeDoc) {
                const elements = Array.from(iframeDoc.querySelectorAll(innerSelector));
                if (elements.length > 0) {
                  results.push({
                    elements,
                    context: `iframe-${iframe.id || iframe.name || 'unknown'}`
                  });
                }
              }
            }
          } catch (error) {
            console.warn(`[FillForm] Error accessing iframe:`, error);
          }
        } else {
          // Regular main document selector
          try {
            const elements = Array.from(document.querySelectorAll(selector));
            if (elements.length > 0) {
              results.push({
                elements,
                context: 'main'
              });
            }
          } catch (error) {
            console.warn(`[FillForm] Error with selector "${selector}":`, error);
          }
        }
        
        return results;
      };

      // Create fill instructions
      const instructions = [];
      Object.entries(fieldMapping).forEach(([fieldName, selectors]) => {
        const value = getCustomerValue(fieldName);
        if (value !== null) {
          const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
          selectorArray.forEach(selector => {
            instructions.push({ selector, value, fieldName });
          });
        }
      });

      console.log(`[FillForm] Executing ${instructions.length} fill instructions...`);

      // Execute fill instructions
      instructions.forEach((instruction, index) => {
        try {
          const elementGroups = findElementsWithSelector(instruction.selector);
          
          if (elementGroups.length === 0) {
            results.push({ 
              field: instruction.fieldName, 
              selector: instruction.selector, 
              value: instruction.value, 
              success: false, 
              error: 'No elements found' 
            });
            return;
          }

          elementGroups.forEach(({ elements, context }) => {
            elements.forEach((element) => {
              try {
                const filled = fillElement(element, instruction.value, context);
                
                if (filled) {
                  filledCount++;
                }
                
                results.push({ 
                  field: instruction.fieldName, 
                  selector: instruction.selector, 
                  value: instruction.value, 
                  success: filled,
                  context: context,
                  elementType: element.tagName.toLowerCase(),
                  error: filled ? null : 'Failed to fill element'
                });
                
              } catch (elementError) {
                results.push({ 
                  field: instruction.fieldName, 
                  selector: instruction.selector, 
                  value: instruction.value, 
                  success: false, 
                  context: context,
                  error: elementError.message
                });
              }
            });
          });
          
        } catch (error) {
          results.push({ 
            field: instruction.fieldName, 
            selector: instruction.selector, 
            value: instruction.value, 
            success: false, 
            error: error.message 
          });
        }
      });

      console.log(`[FillForm] Completed: Filled ${filledCount} fields out of ${instructions.length} instructions`);

      return {
        success: filledCount > 0,
        filledCount,
        totalInstructions: instructions.length,
        results,
        supportsIframes: true,
        supportsAllFieldTypes: true
      };
    },

    /**
     * ENABLE AI SUGGEST MODE
     * Highlights mapped form fields and shows inline suggestions
     */
    enableAiSuggestMode: (data: { 
      customerData: Record<string, any>; 
      customerName: string; 
      selectedTemplate: any;
    }) => {
      const { customerData, customerName, selectedTemplate } = data;
      
      console.log('[AISuggest] Enabling AI suggest mode...');
      console.log('[AISuggest] Customer:', customerName);
      console.log('[AISuggest] Template:', selectedTemplate?.name);

      // Validation
      if (!customerData || typeof customerData !== 'object') {
        return { success: false, error: 'Invalid customer data' };
      }
      
      if (!selectedTemplate || !selectedTemplate.fieldMapping) {
        return { success: false, error: 'No template or field mapping' };
      }

      /**
       * Clean up existing mode
       */
      const cleanupExistingMode = () => {
        // Clean main document
        document.querySelectorAll('.ai-suggest-enabled').forEach(cleanupElement);
        
        // Clean iframes
        document.querySelectorAll('iframe').forEach((iframe) => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              iframeDoc.querySelectorAll('.ai-suggest-enabled').forEach(cleanupElement);
            }
          } catch (error) {
            // Ignore cross-origin errors
          }
        });
      };

      const cleanupElement = (element) => {
        element.classList.remove('ai-suggest-enabled');
        element.style.boxShadow = '';
        element.style.backgroundColor = '';
        element.style.border = '';
        element.style.cursor = '';
        element.title = '';
        
        if (element._originalPlaceholder !== undefined) {
          element.placeholder = element._originalPlaceholder;
        }
        
        // Remove event handlers
        ['_aiSuggestHandler', '_aiFocusHandler', '_aiBlurHandler'].forEach(handlerProp => {
          if (element[handlerProp]) {
            const eventType = handlerProp.includes('Focus') ? 'focus' : 
                            handlerProp.includes('Blur') ? 'blur' : 'click';
            element.removeEventListener(eventType, element[handlerProp]);
            delete element[handlerProp];
          }
        });
        
        // Clear stored data
        delete element._aiSuggestion;
        delete element._originalPlaceholder;
      };

      /**
       * Get customer value
       */
      const getCustomerValue = (fieldName) => {
        let value = customerData[fieldName];
        
        if ((value === undefined || value === null || value === '') && customerData) {
          const lowerFieldName = fieldName.toLowerCase();
          const matchingKey = Object.keys(customerData).find(key => 
            key.toLowerCase() === lowerFieldName
          );
          if (matchingKey) {
            value = customerData[matchingKey];
          }
        }
        
        return (value !== undefined && value !== null && value !== '') ? String(value) : null;
      };

      /**
       * Check if element is valid form field
       */
      const isValidFormField = (element) => {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'input') {
          const inputType = element.type.toLowerCase();
          const allowedTypes = ['text', 'email', 'tel', 'url', 'search', 'password', 'number', 'radio', 'checkbox'];
          return allowedTypes.includes(inputType);
        }
        
        return tagName === 'textarea' || tagName === 'select';
      };

      /**
       * Find mapped fields in document
       */
      const getMappedFieldsInDocument = (doc, context) => {
        const mappedFields = [];
        const fieldMapping = selectedTemplate.fieldMapping;
        
        Object.entries(fieldMapping).forEach(([jsonFieldName, selectors]) => {
          const customerValue = getCustomerValue(jsonFieldName);
          
          if (customerValue !== null) {
            const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
            
            selectorArray.forEach(originalSelector => {
              try {
                let actualSelector = originalSelector;
                if (context.startsWith('iframe-')) {
                  const iframeMatch = originalSelector.match(/^.*?\s+(.+)$/);
                  if (iframeMatch) {
                    actualSelector = iframeMatch[1];
                  }
                }
                
                const elements = doc.querySelectorAll(actualSelector);
                elements.forEach(element => {
                  if (isValidFormField(element)) {
                    mappedFields.push({
                      element: element,
                      jsonFieldName: jsonFieldName,
                      customerValue: customerValue,
                      selector: actualSelector,
                      originalSelector: originalSelector,
                      context: context
                    });
                  }
                });
              } catch (error) {
                console.warn(`[AISuggest] Invalid selector: ${originalSelector}`, error);
              }
            });
          }
        });
        
        return mappedFields;
      };

      /**
       * Show inline suggestion for field
       */
      const showInlineSuggestion = (field, jsonFieldName, customerValue, context) => {
        const element = field;
        
        element._aiSuggestion = {
          key: jsonFieldName,
          value: customerValue,
          context: context
        };
        element._originalPlaceholder = element.placeholder || '';
        
        // Show suggestion based on field type
        const tagName = element.tagName.toLowerCase();
        if (tagName === 'input' && ['text', 'email', 'tel', 'url', 'search', 'password', 'number'].includes(element.type)) {
          if (!element.value || element.value.trim() === '') {
            element.placeholder = `💡 ${customerValue} (from ${jsonFieldName})`;
            element.style.backgroundColor = '#f0f9ff';
            element.style.border = '2px solid #3b82f6';
            element.style.boxShadow = '0 0 0 1px #3b82f6';
          } else {
            element.style.border = '2px solid #10b981';
            element.style.boxShadow = '0 0 0 1px #10b981';
          }
        } else {
          // For selects, radios, checkboxes
          element.style.border = '2px solid #3b82f6';
          element.style.boxShadow = '0 0 0 1px #3b82f6';
          element.style.backgroundColor = '#f0f9ff';
        }
        
        element.title = `AI Suggestion: ${customerValue} (from ${jsonFieldName}) - Click to fill`;
      };

      /**
       * Handle field click
       */
      const handleFieldClick = (field) => {
        const element = field;
        
        if (!element._aiSuggestion) return;
        
        const suggestion = element._aiSuggestion;
        const tagName = element.tagName.toLowerCase();
        
        element.focus();
        
        if (tagName === 'input') {
          const type = element.type.toLowerCase();
          if (['text', 'email', 'tel', 'url', 'search', 'password', 'number'].includes(type)) {
            if (!element.value || element.value.trim() === '') {
              element.value = suggestion.value;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
              element.placeholder = element._originalPlaceholder || '';
            }
          } else if (type === 'checkbox') {
            const shouldCheck = ['true', '1', 'yes', 'on', 'checked'].includes(suggestion.value.toLowerCase());
            element.checked = shouldCheck;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (type === 'radio') {
            if (element.value === suggestion.value) {
              element.checked = true;
              element.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        } else if (tagName === 'select') {
          for (let i = 0; i < element.options.length; i++) {
            const option = element.options[i];
            if (option.value === suggestion.value || 
                option.textContent?.trim().toLowerCase().includes(suggestion.value.toLowerCase())) {
              element.selectedIndex = i;
              element.dispatchEvent(new Event('change', { bubbles: true }));
              break;
            }
          }
        } else if (tagName === 'textarea') {
          element.value = suggestion.value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Visual feedback
        element.style.backgroundColor = '#f0fdf4';
        element.style.border = '2px solid #22c55e';
        setTimeout(() => {
          element.style.backgroundColor = '';
          element.style.border = '2px solid #10b981';
        }, 1000);
      };

      // Main execution
      cleanupExistingMode();
      
      // Get mapped fields from all contexts
      let allMappedFields = [];
      
      // Main document
      allMappedFields.push(...getMappedFieldsInDocument(document, 'main'));
      
      // Iframes
      document.querySelectorAll('iframe').forEach((iframe, index) => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const context = `iframe-${iframe.id || iframe.name || index}`;
            allMappedFields.push(...getMappedFieldsInDocument(iframeDoc, context));
          }
        } catch (error) {
          // Ignore cross-origin errors
        }
      });
      
      if (allMappedFields.length === 0) {
        return { 
          success: false, 
          error: `No mapped fields with data found for template "${selectedTemplate.name}"` 
        };
      }
      
      // Enable suggestions for mapped fields
      let enabledCount = 0;
      allMappedFields.forEach(({ element, jsonFieldName, customerValue, context }) => {
        element.classList.add('ai-suggest-enabled');
        showInlineSuggestion(element, jsonFieldName, customerValue, context);
        
        const clickHandler = () => handleFieldClick(element);
        element._aiSuggestHandler = clickHandler;
        element.addEventListener('click', clickHandler);
        
        enabledCount++;
      });
      
      console.log(`[AISuggest] Enabled suggestions for ${enabledCount} fields`);
      
      return {
        success: true,
        enabledFields: enabledCount,
        templateName: selectedTemplate.name,
        mode: 'inline-suggestions-iframe-support'
      };
    },

    /**
     * DISABLE AI SUGGEST MODE
     * Removes all AI suggest styling and handlers
     */
    disableAiSuggestMode: () => {
      console.log('[AISuggest] Disabling AI suggest mode...');
      
      // Clean main document
      document.querySelectorAll('.ai-suggest-enabled').forEach(element => {
        element.classList.remove('ai-suggest-enabled');
        element.style.boxShadow = '';
        element.style.backgroundColor = '';
        element.style.border = '';
        element.style.cursor = '';
        element.title = '';
        
        if (element._originalPlaceholder !== undefined) {
          element.placeholder = element._originalPlaceholder;
        }
        
        if (element._aiSuggestHandler) {
          element.removeEventListener('click', element._aiSuggestHandler);
          delete element._aiSuggestHandler;
        }
        
        delete element._aiSuggestion;
        delete element._originalPlaceholder;
      });
      
      // Clean iframes
      document.querySelectorAll('iframe').forEach((iframe) => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.querySelectorAll('.ai-suggest-enabled').forEach(element => {
              element.classList.remove('ai-suggest-enabled');
              element.style.boxShadow = '';
              element.style.backgroundColor = '';
              element.style.border = '';
              element.style.cursor = '';
              element.title = '';
              
              if (element._originalPlaceholder !== undefined) {
                element.placeholder = element._originalPlaceholder;
              }
              
              if (element._aiSuggestHandler) {
                element.removeEventListener('click', element._aiSuggestHandler);
                delete element._aiSuggestHandler;
              }
              
              delete element._aiSuggestion;
              delete element._originalPlaceholder;
            });
          }
        } catch (error) {
          // Ignore cross-origin errors
        }
      });
      
      return {
        success: true,
        message: 'AI Suggest mode disabled'
      };
    },
  },

  init: () => console.log('[AISuggest-AutoFill] Feature loaded successfully'),
};

export default config;