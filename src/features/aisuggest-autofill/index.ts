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
     * IMPROVED COMPREHENSIVE FORM FILLING - Enhanced for dynamic field mapping
     */
    fillFormWithMapping: (data: { 
      customerData: Record<string, any>; 
      fieldMapping: Record<string, string | string[]> 
    }) => {
      const { customerData, fieldMapping } = data;
      let filledCount = 0;
      const results = [];
      
      console.log('[FillForm] Starting enhanced form filling with dynamic customer data...');
      console.log('[FillForm] Customer data keys:', Object.keys(customerData));
      console.log('[FillForm] Field mapping:', fieldMapping);

      /**
       * IMPROVED: Get customer value with enhanced fallback for dynamic fields
       */
      const getCustomerValue = (fieldName) => {
        console.log('[FillForm] Looking for field:', fieldName, 'in customer data');
        
        // Direct lookup first
        let value = customerData[fieldName];
        
        if ((value === undefined || value === null || value === '') && customerData) {
          // Try case-insensitive lookup
          const lowerFieldName = fieldName.toLowerCase();
          const matchingKey = Object.keys(customerData).find(key => 
            key.toLowerCase() === lowerFieldName
          );
          if (matchingKey) {
            value = customerData[matchingKey];
            console.log('[FillForm] Found value via case-insensitive match:', matchingKey, '=', value);
          }
          
          // Try partial matching for common variations
          if (!value) {
            const partialMatchKey = Object.keys(customerData).find(key => {
              const lowerKey = key.toLowerCase();
              return (
                lowerKey.includes(lowerFieldName) || 
                lowerFieldName.includes(lowerKey) ||
                // Handle common field name variations
                (lowerFieldName.includes('name') && lowerKey.includes('name')) ||
                (lowerFieldName.includes('phone') && (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('contact'))) ||
                (lowerFieldName.includes('email') && (lowerKey.includes('email') || lowerKey.includes('mail'))) ||
                (lowerFieldName.includes('address') && lowerKey.includes('address')) ||
                (lowerFieldName.includes('company') && (lowerKey.includes('company') || lowerKey.includes('organization')))
              );
            });
            
            if (partialMatchKey) {
              value = customerData[partialMatchKey];
              console.log('[FillForm] Found value via partial match:', partialMatchKey, '=', value);
            }
          }
        }
        
        const finalValue = (value !== undefined && value !== null && value !== '') 
          ? String(value).trim() 
          : null;
          
        console.log('[FillForm] Final value for', fieldName, ':', finalValue);
        return finalValue;
      };

      /**
       * IMPROVED: Fill text input or textarea with better event handling
       */
      const fillTextElement = (element, value, context) => {
        try {
          // Clear existing value first
          element.value = '';
          element.focus();
          
          // Set the new value
          element.value = value;
          
          // Trigger comprehensive events for maximum compatibility
          const events = [
            new Event('focus', { bubbles: true }),
            new Event('input', { bubbles: true }),
            new Event('change', { bubbles: true }),
            new Event('blur', { bubbles: true }),
            new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
            new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' })
          ];
          
          events.forEach(event => {
            try {
              element.dispatchEvent(event);
            } catch (eventError) {
              console.warn('[FillForm] Event dispatch error:', eventError);
            }
          });
          
          // Additional React/Vue compatibility
          if (element._valueTracker) {
            element._valueTracker.setValue('');
            element._valueTracker.setValue(value);
          }
          
          // Trigger property setter for React
          const valueSetter = Object.getOwnPropertyDescriptor(element, 'value') || 
                             Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
          if (valueSetter && valueSetter.set) {
            valueSetter.set.call(element, value);
          }
          
          console.log(`[FillForm] ✅ Filled text field in ${context}: "${value}"`);
          return true;
        } catch (error) {
          console.error(`[FillForm] Error filling text element:`, error);
          return false;
        }
      };

      /**
       * IMPROVED: Fill select element with better option matching
       */
      const fillSelectElement = (element, value, context) => {
        try {
          console.log(`[FillForm] Filling select in ${context} with: "${value}"`);
          
          let optionFound = false;
          const lowerValue = value.toLowerCase().trim();
          
          // Strategy 1: Exact value match
          for (let i = 0; i < element.options.length; i++) {
            if (element.options[i].value === value) {
              element.selectedIndex = i;
              optionFound = true;
              break;
            }
          }
          
          // Strategy 2: Exact text content match
          if (!optionFound) {
            for (let i = 0; i < element.options.length; i++) {
              const optionText = element.options[i].textContent?.trim().toLowerCase() || '';
              if (optionText === lowerValue) {
                element.selectedIndex = i;
                optionFound = true;
                break;
              }
            }
          }
          
          // Strategy 3: Partial text content match
          if (!optionFound) {
            for (let i = 0; i < element.options.length; i++) {
              const optionText = element.options[i].textContent?.trim().toLowerCase() || '';
              if (optionText.includes(lowerValue) || lowerValue.includes(optionText)) {
                element.selectedIndex = i;
                optionFound = true;
                break;
              }
            }
          }
          
          // Strategy 4: Smart matching for common values
          if (!optionFound) {
            const smartMatches = {
              'male': ['male', 'm', 'mr', 'man'],
              'female': ['female', 'f', 'mrs', 'ms', 'woman'],
              'yes': ['yes', 'y', 'true', 'accept', 'agree'],
              'no': ['no', 'n', 'false', 'decline', 'disagree']
            };
            
            for (const [category, variations] of Object.entries(smartMatches)) {
              if (variations.includes(lowerValue)) {
                for (let i = 0; i < element.options.length; i++) {
                  const optionText = element.options[i].textContent?.trim().toLowerCase() || '';
                  const optionValue = element.options[i].value?.toLowerCase() || '';
                  
                  if (variations.some(v => optionText.includes(v) || optionValue.includes(v))) {
                    element.selectedIndex = i;
                    optionFound = true;
                    break;
                  }
                }
                if (optionFound) break;
              }
            }
          }
          
          if (optionFound) {
            element.focus();
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
            console.log(`[FillForm] ✅ Selected option in ${context}: "${element.options[element.selectedIndex].textContent}"`);
            return true;
          } else {
            console.warn(`[FillForm] ❌ No matching option for: "${value}" in select with ${element.options.length} options`);
            return false;
          }
        } catch (error) {
          console.error(`[FillForm] Error filling select:`, error);
          return false;
        }
      };

      /**
       * IMPROVED: Fill radio button group with better matching
       */
      const fillRadioElement = (element, value, context) => {
        try {
          const groupName = element.name;
          if (!groupName) return false;
          
          const doc = element.ownerDocument || document;
          const radioGroup = Array.from(doc.querySelectorAll(`input[type="radio"][name="${groupName}"]`));
          
          const lowerValue = value.toLowerCase().trim();
          
          // Try exact value match first
          for (const radio of radioGroup) {
            if (radio.value === value) {
              radio.checked = true;
              radio.focus();
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`[FillForm] ✅ Selected radio in ${context}: "${value}"`);
              return true;
            }
          }
          
          // Try label-based matching
          for (const radio of radioGroup) {
            const label = doc.querySelector(`label[for="${radio.id}"]`)?.textContent?.toLowerCase().trim();
            if (label && (label === lowerValue || label.includes(lowerValue) || lowerValue.includes(label))) {
              radio.checked = true;
              radio.focus();
              radio.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`[FillForm] ✅ Selected radio by label in ${context}: "${label}"`);
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
       * IMPROVED: Fill checkbox element with smart boolean detection
       */
      const fillCheckboxElement = (element, value, context) => {
        try {
          const lowerValue = value.toLowerCase().trim();
          
          // Enhanced boolean detection
          const truthyValues = ['true', '1', 'yes', 'on', 'checked', 'active', 'enabled', 'agree', 'accept'];
          const falsyValues = ['false', '0', 'no', 'off', 'unchecked', 'inactive', 'disabled', 'disagree', 'decline'];
          
          let shouldCheck = false;
          
          if (truthyValues.includes(lowerValue)) {
            shouldCheck = true;
          } else if (falsyValues.includes(lowerValue)) {
            shouldCheck = false;
          } else if (element.value === value) {
            shouldCheck = true;
          } else {
            // Default to true for non-empty values
            shouldCheck = Boolean(value && value !== '0');
          }
          
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
       * IMPROVED: Fill element based on type with better type detection
       */
      const fillElement = (element, value, context) => {
        const tagName = element.tagName.toLowerCase();
        const inputType = element.type?.toLowerCase();
        
        console.log(`[FillForm] Filling element: ${tagName}[type="${inputType}"] with value: "${value}"`);
        
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
            case 'date':
            case 'datetime-local':
            case 'month':
            case 'week':
            case 'time':
              return fillTextElement(element, value, context);
            case 'radio':
              return fillRadioElement(element, value, context);
            case 'checkbox':
              return fillCheckboxElement(element, value, context);
            default:
              console.warn(`[FillForm] Unsupported input type: ${inputType}`);
              // Try as text input anyway
              return fillTextElement(element, value, context);
          }
        } else if (tagName === 'textarea') {
          return fillTextElement(element, value, context);
        }
        
        return false;
      };

      /**
       * IMPROVED: Find elements with selector (supports iframes and shadow DOM)
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
            
            // Also check shadow DOMs
            const shadowHosts = document.querySelectorAll('*');
            shadowHosts.forEach(host => {
              if (host.shadowRoot) {
                try {
                  const shadowElements = Array.from(host.shadowRoot.querySelectorAll(selector));
                  if (shadowElements.length > 0) {
                    results.push({
                      elements: shadowElements,
                      context: 'shadow-dom'
                    });
                  }
                } catch (shadowError) {
                  // Ignore shadow DOM access errors
                }
              }
            });
          } catch (error) {
            console.warn(`[FillForm] Error with selector "${selector}":`, error);
          }
        }
        
        return results;
      };

      // IMPROVED: Create fill instructions with better validation
      const instructions = [];
      Object.entries(fieldMapping).forEach(([fieldName, selectors]) => {
        const value = getCustomerValue(fieldName);
        if (value !== null && value !== '') {
          const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
          selectorArray.forEach(selector => {
            if (selector && typeof selector === 'string') {
              instructions.push({ selector, value, fieldName });
            }
          });
        } else {
          console.log(`[FillForm] Skipping field "${fieldName}" - no value found`);
        }
      });

      console.log(`[FillForm] Executing ${instructions.length} fill instructions...`);

      // Execute fill instructions with improved error handling
      instructions.forEach((instruction, index) => {
        try {
          const elementGroups = findElementsWithSelector(instruction.selector);
          
          if (elementGroups.length === 0) {
            console.warn(`[FillForm] No elements found for selector: ${instruction.selector}`);
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
            elements.forEach((element, elementIndex) => {
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
                  elementIndex: elementIndex,
                  error: filled ? null : 'Failed to fill element'
                });
                
                // Add small delay between fills for better compatibility
                if (filled && elementIndex < elements.length - 1) {
                  setTimeout(() => {}, 50);
                }
                
              } catch (elementError) {
                console.error(`[FillForm] Error filling element:`, elementError);
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
          console.error(`[FillForm] Error processing instruction:`, error);
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
        supportsAllFieldTypes: true,
        supportsShadowDOM: true,
        enhancedMatching: true
      };
    },

    /**
     * ENHANCED AI SUGGEST MODE - Improved for dynamic field mapping
     */
    enableAiSuggestMode: (data: { 
      customerData: Record<string, any>; 
      customerName: string; 
      selectedTemplate: any;
    }) => {
      const { customerData, customerName, selectedTemplate } = data;
      
      console.log('[AISuggest] Enabling enhanced AI suggest mode...');
      console.log('[AISuggest] Customer:', customerName);
      console.log('[AISuggest] Customer data keys:', Object.keys(customerData));
      console.log('[AISuggest] Template:', selectedTemplate?.name);

      // Enhanced validation
      if (!customerData || typeof customerData !== 'object') {
        return { success: false, error: 'Invalid customer data' };
      }
      
      if (!selectedTemplate || !selectedTemplate.fieldMapping) {
        return { success: false, error: 'No template or field mapping' };
      }

      // Cleanup existing AI suggest elements
      const cleanupExistingElements = (doc = document) => {
        doc.querySelectorAll('.ai-suggest-enabled').forEach(element => {
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
      };

      // Clean main document
      cleanupExistingElements(document);

      // Clean iframes
      document.querySelectorAll('iframe').forEach((iframe) => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            cleanupExistingElements(iframeDoc);
          }
        } catch (error) {
          // Ignore cross-origin errors
        }
      });

      /**
       * IMPROVED: Get customer value with enhanced lookup for dynamic fields
       */
      const getCustomerValue = (jsonFieldName) => {
        // Direct lookup first
        let value = customerData[jsonFieldName];
        
        if ((value === undefined || value === null || value === '') && customerData) {
          // Try case-insensitive lookup
          const lowerFieldName = jsonFieldName.toLowerCase();
          const matchingKey = Object.keys(customerData).find(key => 
            key.toLowerCase() === lowerFieldName
          );
          if (matchingKey) {
            value = customerData[matchingKey];
          }
          
          // Try partial matching for better field detection
          if (!value) {
            const partialMatchKey = Object.keys(customerData).find(key => {
              const lowerKey = key.toLowerCase();
              return (
                lowerKey.includes(lowerFieldName) || 
                lowerFieldName.includes(lowerKey) ||
                // Handle common field name variations
                (lowerFieldName.includes('name') && lowerKey.includes('name')) ||
                (lowerFieldName.includes('phone') && (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('contact'))) ||
                (lowerFieldName.includes('email') && (lowerKey.includes('email') || lowerKey.includes('mail'))) ||
                (lowerFieldName.includes('address') && lowerKey.includes('address')) ||
                (lowerFieldName.includes('company') && (lowerKey.includes('company') || lowerKey.includes('organization')))
              );
            });
            
            if (partialMatchKey) {
              value = customerData[partialMatchKey];
            }
          }
        }
        
        return (value !== undefined && value !== null && value !== '') 
          ? String(value).trim() 
          : null;
      };

      /**
       * ENHANCED: Show inline suggestion for field with better styling
       */
      const showInlineSuggestion = (field, jsonFieldName, customerValue, context) => {
        const element = field;
        
        element._aiSuggestion = {
          key: jsonFieldName,
          value: customerValue,
          context: context
        };
        element._originalPlaceholder = element.placeholder || '';
        element.classList.add('ai-suggest-enabled');
        
        // Enhanced suggestion display based on field type and current value
        const tagName = element.tagName.toLowerCase();
        const currentValue = element.value?.trim() || '';
        
        if (tagName === 'input' && ['text', 'email', 'tel', 'url', 'search', 'password', 'number'].includes(element.type)) {
          if (!currentValue) {
            // Empty field - blue highlighting with suggestion placeholder
            element.placeholder = `💡 ${customerValue} (from ${jsonFieldName})`;
            element.style.backgroundColor = '#f0f9ff';
            element.style.border = '2px solid #3b82f6';
            element.style.boxShadow = '0 0 0 1px #3b82f6, 0 0 10px rgba(59, 130, 246, 0.3)';
            element.style.cursor = 'pointer';
            element.title = `AI Suggestion: ${customerValue} (from ${jsonFieldName}) - Click to fill`;
          } else {
            // Field with existing value - green highlighting to show it's mapped
            element.style.backgroundColor = '#f0fdf4';
            element.style.border = '2px solid #10b981';
            element.style.boxShadow = '0 0 0 1px #10b981, 0 0 10px rgba(16, 185, 129, 0.3)';
            element.style.cursor = 'pointer';
            element.title = `Field has data. AI Suggestion available: ${customerValue} (from ${jsonFieldName}) - Click to replace`;
          }
        } else if (tagName === 'select') {
          // For selects - purple highlighting
          element.style.border = '2px solid #8b5cf6';
          element.style.boxShadow = '0 0 0 1px #8b5cf6, 0 0 10px rgba(139, 92, 246, 0.3)';
          element.style.backgroundColor = '#faf5ff';
          element.style.cursor = 'pointer';
          element.title = `AI Suggestion: ${customerValue} (from ${jsonFieldName}) - Click to select`;
        } else if (tagName === 'textarea') {
          if (!currentValue) {
            element.placeholder = `💡 ${customerValue.substring(0, 50)}... (from ${jsonFieldName})`;
            element.style.backgroundColor = '#f0f9ff';
            element.style.border = '2px solid #3b82f6';
            element.style.boxShadow = '0 0 0 1px #3b82f6, 0 0 10px rgba(59, 130, 246, 0.3)';
          } else {
            element.style.backgroundColor = '#f0fdf4';
            element.style.border = '2px solid #10b981';
            element.style.boxShadow = '0 0 0 1px #10b981, 0 0 10px rgba(16, 185, 129, 0.3)';
          }
          element.style.cursor = 'pointer';
          element.title = `AI Suggestion: ${customerValue} (from ${jsonFieldName}) - Click to fill`;
        } else {
          // For other field types - orange highlighting
          element.style.border = '2px solid #f59e0b';
          element.style.boxShadow = '0 0 0 1px #f59e0b, 0 0 10px rgba(245, 158, 11, 0.3)';
          element.style.backgroundColor = '#fffbeb';
          element.style.cursor = 'pointer';
          element.title = `AI Suggestion: ${customerValue} (from ${jsonFieldName}) - Click to fill`;
        }
      };

      /**
       * ENHANCED: Handle field click with better form compatibility
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
            if (!element.value || element.value.trim() === '' || confirm('Replace existing value?')) {
              // Enhanced input filling
              element.value = '';
              element.value = suggestion.value;
              
              // Trigger comprehensive events
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
              element.dispatchEvent(new Event('blur', { bubbles: true }));
              
              // React compatibility
              if (element._valueTracker) {
                element._valueTracker.setValue('');
                element._valueTracker.setValue(suggestion.value);
              }
              
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
          // Enhanced select filling
          const lowerValue = suggestion.value.toLowerCase().trim();
          let optionSelected = false;
          
          for (let i = 0; i < element.options.length; i++) {
            const option = element.options[i];
            const optionText = option.textContent?.trim().toLowerCase() || '';
            const optionValue = option.value?.toLowerCase() || '';
            
            if (optionValue === suggestion.value || 
                optionText === lowerValue ||
                optionText.includes(lowerValue) ||
                lowerValue.includes(optionText)) {
              element.selectedIndex = i;
              element.dispatchEvent(new Event('change', { bubbles: true }));
              optionSelected = true;
              break;
            }
          }
          
          if (!optionSelected) {
            console.warn('[AISuggest] No matching option found for:', suggestion.value);
          }
        } else if (tagName === 'textarea') {
          if (!element.value || element.value.trim() === '' || confirm('Replace existing content?')) {
            element.value = suggestion.value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        
        // Enhanced visual feedback
        element.style.backgroundColor = '#f0fdf4';
        element.style.border = '2px solid #22c55e';
        element.style.boxShadow = '0 0 0 1px #22c55e, 0 0 15px rgba(34, 197, 94, 0.4)';
        
        setTimeout(() => {
          element.style.backgroundColor = '';
          element.style.border = '2px solid #10b981';
          element.style.boxShadow = '0 0 0 1px #10b981';
        }, 1000);
      };

      // Process field mapping and enable suggestions
      let enabledCount = 0;

      Object.entries(selectedTemplate.fieldMapping).forEach(([jsonFieldName, selectors]) => {
        const customerValue = getCustomerValue(jsonFieldName);
        
        if (!customerValue) {
          console.log(`[AISuggest] No value found for field: ${jsonFieldName}`);
          return;
        }

        const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
        
        selectorArray.forEach(selector => {
          try {
            // Check for iframe selectors
            const iframeMatch = selector.match(/^(#[\w-]+|iframe\[name="[^"]+"\]|iframe:nth-of-type\(\d+\))\s+(.+)$/);
            
            if (iframeMatch) {
              const [, iframeSelector, innerSelector] = iframeMatch;
              
              try {
                const iframe = document.querySelector(iframeSelector);
                if (iframe) {
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (iframeDoc) {
                    const iframeFields = iframeDoc.querySelectorAll(innerSelector);
                    iframeFields.forEach(field => {
                      showInlineSuggestion(field, jsonFieldName, customerValue, `iframe-${iframe.id || 'unknown'}`);
                      
                      const clickHandler = () => handleFieldClick(field);
                      field._aiSuggestHandler = clickHandler;
                      field.addEventListener('click', clickHandler);
                      enabledCount++;
                    });
                  }
                }
              } catch (error) {
                console.warn(`[AISuggest] Error with iframe selector "${selector}":`, error);
              }
            } else {
              // Main document selector
              const fields = document.querySelectorAll(selector);
              fields.forEach(field => {
                showInlineSuggestion(field, jsonFieldName, customerValue, 'main');
                
                const clickHandler = () => handleFieldClick(field);
                field._aiSuggestHandler = clickHandler;
                field.addEventListener('click', clickHandler);
                enabledCount++;
              });
            }
          } catch (error) {
            console.warn(`[AISuggest] Error with selector "${selector}":`, error);
          }
        });
      });

      console.log(`[AISuggest] Enhanced AI suggestions enabled for ${enabledCount} fields`);

      return {
        success: true,
        enabledFields: enabledCount,
        templateName: selectedTemplate.name,
        customerName: customerName,
        mode: 'enhanced-inline-suggestions-with-dynamic-mapping'
      };
    },

    /**
     * DISABLE AI SUGGEST MODE - Enhanced cleanup
     */
    disableAiSuggestMode: () => {
      console.log('[AISuggest] Disabling enhanced AI suggest mode...');
      
      const cleanupDocument = (doc = document) => {
        doc.querySelectorAll('.ai-suggest-enabled').forEach(element => {
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
      };
      
      // Clean main document
      cleanupDocument(document);
      
      // Clean iframes
      document.querySelectorAll('iframe').forEach((iframe) => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            cleanupDocument(iframeDoc);
          }
        } catch (error) {
          // Ignore cross-origin errors
        }
      });
      
      return {
        success: true,
        message: 'Enhanced AI Suggest mode disabled',
        cleanedElements: document.querySelectorAll('.ai-suggest-enabled').length
      };
    },
  },

  init: () => console.log('[AISuggest-AutoFill] Enhanced feature loaded successfully - Optimized for dynamic field mapping'),
};

export default config;