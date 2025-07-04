import type { ModuleConfig } from '@/featuretypes';

/**
 * Complete Customer Management Module
 * Supports all form types, iframes, and field extraction for GDMS and similar applications
 */
const config: ModuleConfig = {
  name: 'customer',

  // UI Configuration
  ui: {
    popup: {
      tab: {
        label: 'Customer',
        icon: 'Users',
        order: 1,
        requiresTab: true,
      },
      component: () => import('./components/PopupTab.tsx'),
    },
    options: {
      panel: {
        label: 'Customer Management',
        icon: 'Users',
        section: 'features',
        order: 1,
      },
      component: () => import('./components/OptionsPanel.tsx'),
    },
  },

  handlers: {
    /**
     * COMPREHENSIVE FORM FIELD EXTRACTION
     * Extracts all form fields from main document and iframes
     * Supports: text, email, tel, password, number, select, textarea, radio, checkbox
     * Handles: standalone inputs (no forms), iframe fields, disabled field filtering
     */
    /**
 * IMPROVED COMPREHENSIVE FORM FIELD EXTRACTION
 * Enhanced version with better iframe handling, more lenient filtering, and comprehensive debugging
 */
extractFormFields: () => {
  console.log('🔍 === IMPROVED COMPREHENSIVE FORM FIELD EXTRACTION ===');
  
  const allFields = [];
  let globalFieldCounter = 0;
  
  /**
   * Enhanced visibility check (more lenient)
   */
  const isElementVisible = (element) => {
    try {
      // Very basic check - if element exists and has dimensions
      return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
    } catch (error) {
      return true; // Assume visible if can't check
    }
  };

  /**
   * Enhanced label detection with multiple fallback strategies
   */
  const getFieldLabel = (element, doc = document) => {
    let label = '';
    
    try {
      // Method 1: Associated label element
      if (element.labels && element.labels.length > 0) {
        label = element.labels[0].textContent?.trim() || '';
      }
      
      // Method 2: Label with for attribute
      if (!label && element.id) {
        const labelElement = doc.querySelector(`label[for="${element.id}"]`);
        if (labelElement) {
          label = labelElement.textContent?.trim() || '';
        }
      }
      
      // Method 3: Placeholder text
      if (!label && element.placeholder) {
        label = element.placeholder;
      }
      
      // Method 4: Title attribute
      if (!label && element.title) {
        label = element.title;
      }
      
      // Method 5: aria-label
      if (!label && element.getAttribute('aria-label')) {
        label = element.getAttribute('aria-label');
      }
      
      // Method 6: Parent element text (enhanced search)
      if (!label) {
        const searchParents = ['td', 'th', 'div', 'span', 'label', 'fieldset', 'legend'];
        for (const parentTag of searchParents) {
          const parent = element.closest(parentTag);
          if (parent) {
            const parentText = parent.textContent?.trim() || '';
            // Look for text that's not too long and doesn't contain the element's own text
            if (parentText.length > 0 && parentText.length < 200 && !parentText.includes('\n\n')) {
              const cleanText = parentText.replace(/\s+/g, ' ').trim();
              if (cleanText !== element.value && cleanText !== element.placeholder) {
                label = cleanText;
                break;
              }
            }
          }
        }
      }
      
      // Method 7: Previous sibling text
      if (!label && element.previousElementSibling) {
        const siblingText = element.previousElementSibling.textContent?.trim();
        if (siblingText && siblingText.length < 100) {
          label = siblingText;
        }
      }
      
      // Method 8: Data attributes
      if (!label) {
        const dataLabel = element.getAttribute('data-label') || 
                         element.getAttribute('data-field-name') ||
                         element.getAttribute('data-title');
        if (dataLabel) {
          label = dataLabel;
        }
      }
      
    } catch (error) {
      console.warn('Error getting label for element:', error);
    }
    
    return label || element.name || element.id || `field_${globalFieldCounter++}`;
  };

  /**
   * Enhanced selector generation with multiple fallback strategies
   */
  const generateSelector = (element) => {
    try {
      // Strategy 1: Name attribute (most reliable for forms)
      if (element.name && element.name.trim()) {
        return `[name="${element.name}"]`;
      }
      
      // Strategy 2: ID attribute
      if (element.id && element.id.trim()) {
        return `#${element.id}`;
      }
      
      // Strategy 3: Class-based selector (if classes exist)
      if (element.className && element.className.trim()) {
        const classes = element.className.trim().split(/\s+/).slice(0, 2); // Use first 2 classes
        const classSelector = classes.map(cls => `.${cls}`).join('');
        return `${element.tagName.toLowerCase()}${classSelector}`;
      }
      
      // Strategy 4: Attribute-based selector
      const type = element.type || element.tagName.toLowerCase();
      if (element.type) {
        return `${element.tagName.toLowerCase()}[type="${element.type}"]`;
      }
      
      // Strategy 5: nth-of-type with parent context
      const tagName = element.tagName.toLowerCase();
      const parent = element.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(el => 
          el.tagName.toLowerCase() === tagName
        );
        const index = siblings.indexOf(element);
        if (index >= 0) {
          return `${tagName}:nth-of-type(${index + 1})`;
        }
      }
      
      // Strategy 6: Fallback
      return tagName;
      
    } catch (error) {
      console.warn('Error generating selector:', error);
      return element.tagName?.toLowerCase() || 'unknown';
    }
  };

  /**
   * Enhanced select field information extraction
   */
  const extractSelectInfo = (selectElement) => {
    try {
      const options = Array.from(selectElement.options || []).map((option, index) => ({
        value: option.value || '',
        text: option.textContent?.trim() || '',
        selected: option.selected,
        index: index
      }));
      
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      
      return {
        options,
        selectedValue: selectElement.value || '',
        selectedText: selectedOption?.textContent?.trim() || '',
        selectedIndex: selectElement.selectedIndex,
        multiple: selectElement.multiple || false,
        size: selectElement.size || 1,
        optionCount: options.length
      };
    } catch (error) {
      console.warn('Error extracting select info:', error);
      return { options: [], selectedValue: '', selectedText: '', multiple: false };
    }
  };

  /**
   * Enhanced field extraction from document with better error handling
   */
  const extractFromDocument = (doc, context = 'main', iframeSelector = '') => {
    console.log(`🔍 Extracting from ${context}...`);
    
    try {
      const forms = doc.forms || [];
      const allInputs = doc.querySelectorAll('input') || [];
      const allSelects = doc.querySelectorAll('select') || [];
      const allTextareas = doc.querySelectorAll('textarea') || [];
      
      console.log(`  📊 Found: ${forms.length} forms, ${allInputs.length} inputs, ${allSelects.length} selects, ${allTextareas.length} textareas`);
      
      let extractedCount = 0;
      let skippedCount = 0;

      // Process ALL inputs (more lenient filtering)
      allInputs.forEach((input, index) => {
        try {
          const type = input.type || 'text';
          const name = input.name || input.id || `${context}_input_${index}`;
          
          // More lenient filtering - only exclude clearly problematic types
          const isExcludedType = ['hidden', 'submit', 'button', 'reset', 'image', 'file'].includes(type.toLowerCase());
          
          // Don't filter out disabled fields or fields without identifiers in this version
          if (!isExcludedType) {
            const baseSelector = generateSelector(input);
            const fullSelector = iframeSelector ? `${iframeSelector} ${baseSelector}` : baseSelector;
            
            const fieldData = {
              name: name,
              id: input.id || '',
              type: type,
              placeholder: input.placeholder || '',
              label: getFieldLabel(input, doc),
              value: input.value || '',
              selector: fullSelector,
              isVisible: isElementVisible(input),
              isDisabled: input.disabled || false,
              isReadOnly: input.readOnly || false,
              context: context,
              className: input.className || '',
              formIndex: input.form ? Array.from(forms).indexOf(input.form) : -1,
              hasName: !!(input.name),
              hasId: !!(input.id),
              elementIndex: index,
              ...(type === 'checkbox' && { checked: input.checked }),
              ...(type === 'radio' && { checked: input.checked }),
              ...(iframeSelector && { iframeSelector }),
            };

            allFields.push(fieldData);
            extractedCount++;
            console.log(`    ✅ Added: ${name} (${type}) - ${fieldData.label}`);
          } else {
            skippedCount++;
            console.log(`    ⚠️ Skipped: ${name} (excluded type: ${type})`);
          }
        } catch (error) {
          console.warn(`    ❌ Error processing input ${index}:`, error);
          skippedCount++;
        }
      });

      // Process ALL selects
      allSelects.forEach((select, index) => {
        try {
          const name = select.name || select.id || `${context}_select_${index}`;
          
          const baseSelector = generateSelector(select);
          const fullSelector = iframeSelector ? `${iframeSelector} ${baseSelector}` : baseSelector;
          const selectInfo = extractSelectInfo(select);

          const fieldData = {
            name: name,
            id: select.id || '',
            type: 'select',
            placeholder: '',
            label: getFieldLabel(select, doc),
            value: selectInfo.selectedValue,
            selectedText: selectInfo.selectedText,
            selector: fullSelector,
            isVisible: isElementVisible(select),
            isDisabled: select.disabled || false,
            context: context,
            className: select.className || '',
            formIndex: select.form ? Array.from(forms).indexOf(select.form) : -1,
            hasName: !!(select.name),
            hasId: !!(select.id),
            elementIndex: index,
            selectInfo: selectInfo,
            ...(iframeSelector && { iframeSelector }),
          };

          allFields.push(fieldData);
          extractedCount++;
          console.log(`    ✅ Added: ${name} (select with ${selectInfo.optionCount} options) - ${fieldData.label}`);
        } catch (error) {
          console.warn(`    ❌ Error processing select ${index}:`, error);
          skippedCount++;
        }
      });

      // Process ALL textareas
      allTextareas.forEach((textarea, index) => {
        try {
          const name = textarea.name || textarea.id || `${context}_textarea_${index}`;
          
          const baseSelector = generateSelector(textarea);
          const fullSelector = iframeSelector ? `${iframeSelector} ${baseSelector}` : baseSelector;

          const fieldData = {
            name: name,
            id: textarea.id || '',
            type: 'textarea',
            placeholder: textarea.placeholder || '',
            label: getFieldLabel(textarea, doc),
            value: textarea.value || '',
            selector: fullSelector,
            isVisible: isElementVisible(textarea),
            isDisabled: textarea.disabled || false,
            isReadOnly: textarea.readOnly || false,
            context: context,
            className: textarea.className || '',
            formIndex: textarea.form ? Array.from(forms).indexOf(textarea.form) : -1,
            hasName: !!(textarea.name),
            hasId: !!(textarea.id),
            elementIndex: index,
            rows: textarea.rows || 0,
            cols: textarea.cols || 0,
            ...(iframeSelector && { iframeSelector }),
          };

          allFields.push(fieldData);
          extractedCount++;
          console.log(`    ✅ Added: ${name} (textarea) - ${fieldData.label}`);
        } catch (error) {
          console.warn(`    ❌ Error processing textarea ${index}:`, error);
          skippedCount++;
        }
      });

      console.log(`  📊 ${context} result: ${extractedCount} fields extracted, ${skippedCount} skipped`);
      return extractedCount;
      
    } catch (error) {
      console.error(`❌ Error extracting from ${context}:`, error);
      return 0;
    }
  };

  /**
   * Enhanced iframe processing with retry logic
   */
  const extractFromIframes = async () => {
    const iframes = document.querySelectorAll('iframe');
    console.log(`🖼️ Processing ${iframes.length} iframes...`);

    for (let index = 0; index < iframes.length; index++) {
      const iframe = iframes[index];
      
      try {
        const iframeId = iframe.id || iframe.name || `iframe-${index}`;
        const iframeSelector = iframe.id ? `#${iframe.id}` : 
                             iframe.name ? `iframe[name="${iframe.name}"]` : 
                             `iframe:nth-of-type(${index + 1})`;

        console.log(`🖼️ Processing iframe ${index}: ${iframeId}`);
        console.log(`   📍 Src: ${iframe.src || 'no src'}`);
        console.log(`   📍 Ready state: ${iframe.readyState || 'unknown'}`);

        // Multiple attempts to access iframe
        let iframeDoc = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !iframeDoc) {
          try {
            if (attempts > 0) {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            }
            
            iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            
            if (iframeDoc && iframeDoc.readyState === 'loading') {
              console.log(`   ⏳ Iframe ${iframeId} still loading, waiting...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            }
            
            attempts++;
          } catch (error) {
            console.warn(`   ❌ Attempt ${attempts} failed for iframe ${iframeId}: ${error.message}`);
            attempts++;
          }
        }

        if (!iframeDoc) {
          console.warn(`   ❌ Could not access iframe ${iframeId} after ${maxAttempts} attempts`);
          continue;
        }

        console.log(`   ✅ Successfully accessed iframe ${iframeId} (${iframeDoc.readyState})`);
        
        // Log iframe content summary
        const iframeInputs = iframeDoc.querySelectorAll('input').length;
        const iframeSelects = iframeDoc.querySelectorAll('select').length;
        const iframeTextareas = iframeDoc.querySelectorAll('textarea').length;
        console.log(`   📊 Iframe ${iframeId} contains: ${iframeInputs} inputs, ${iframeSelects} selects, ${iframeTextareas} textareas`);
        
        extractFromDocument(iframeDoc, `iframe-${iframeId}`, iframeSelector);

      } catch (error) {
        console.error(`   ❌ Fatal error with iframe ${index}:`, error);
      }
    }
  };

  // Main execution with proper async handling
  const runExtraction = async () => {
    try {
      // Extract from main document
      console.log('🔍 Starting main document extraction...');
      const mainCount = extractFromDocument(document, 'main');
      
      // Extract from iframes with retry logic
      console.log('🖼️ Starting iframe extraction...');
      await extractFromIframes();

      // Generate comprehensive statistics
      const fieldTypeStats = {};
      const contextStats = {};
      const visibilityStats = { visible: 0, hidden: 0 };
      const identifierStats = { hasName: 0, hasId: 0, hasNeither: 0 };
      const disabledStats = { enabled: 0, disabled: 0 };
      
      allFields.forEach(field => {
        // Type stats
        fieldTypeStats[field.type] = (fieldTypeStats[field.type] || 0) + 1;
        
        // Context stats
        contextStats[field.context] = (contextStats[field.context] || 0) + 1;
        
        // Visibility stats
        if (field.isVisible) {
          visibilityStats.visible++;
        } else {
          visibilityStats.hidden++;
        }
        
        // Identifier stats
        if (field.hasName && field.hasId) {
          identifierStats.hasName++;
          identifierStats.hasId++;
        } else if (field.hasName) {
          identifierStats.hasName++;
        } else if (field.hasId) {
          identifierStats.hasId++;
        } else {
          identifierStats.hasNeither++;
        }
        
        // Disabled stats
        if (field.isDisabled) {
          disabledStats.disabled++;
        } else {
          disabledStats.enabled++;
        }
      });

      console.log(`🎯 === EXTRACTION COMPLETE ===`);
      console.log(`📊 Total fields: ${allFields.length}`);
      console.log(`📈 Field types:`, fieldTypeStats);
      console.log(`🖼️ Contexts:`, contextStats);
      console.log(`👁️ Visibility:`, visibilityStats);
      console.log(`🏷️ Identifiers:`, identifierStats);
      console.log(`⚡ Status:`, disabledStats);

      // Log sample fields for debugging
      if (allFields.length > 0) {
        console.log('📝 Sample fields (first 5):');
        allFields.slice(0, 5).forEach((field, index) => {
          console.log(`  ${index + 1}. ${field.name} (${field.type}) - "${field.label}" [${field.context}]`);
        });
      }

      return {
        fields: allFields,
        formsCount: document.forms.length,
        url: window.location.href,
        domain: window.location.hostname,
        title: document.title,
        timestamp: Date.now(),
        fieldTypes: Object.keys(fieldTypeStats),
        fieldTypeStats: fieldTypeStats,
        contextStats: contextStats,
        visibilityStats: visibilityStats,
        identifierStats: identifierStats,
        disabledStats: disabledStats,
        totalFields: allFields.length,
        contexts: Object.keys(contextStats),
        iframeCount: document.querySelectorAll('iframe').length,
        hasIframes: document.querySelectorAll('iframe').length > 0,
        success: allFields.length > 0,
        extractionMode: 'improved-comprehensive-all-types',
        version: '2.0-enhanced'
      };

    } catch (error) {
      console.error('💥 Extraction failed:', error);
      return {
        fields: [],
        error: error.message,
        success: false,
        extractionMode: 'improved-comprehensive-failed',
        version: '2.0-enhanced'
      };
    }
  };

  // Return promise for async execution
  return runExtraction();
},

    /**
     * COMPREHENSIVE FORM FILLING
     * Fills all types of form fields with customer data
     * Supports: text inputs, selects, radio buttons, checkboxes, textareas
     * Handles: main document and iframe fields
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

    /**
     * DEBUG HANDLERS FOR TROUBLESHOOTING
     */
    
    // Test extraction return value
    testExtractionReturn: () => {
      console.log('🧪 Testing extraction return value...');
      
      try {
        const result = handlers.extractFormFields();
        
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

    // Comprehensive iframe test
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
    }
  },

  // Module initialization
  init: () => console.log('[Customer] Complete module loaded successfully'),
};

export default config;