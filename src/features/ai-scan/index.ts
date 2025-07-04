// features/ai-scan/index.ts
import type { ModuleConfig } from '@/featuretypes';

const config: ModuleConfig = {
  name: 'ai-scan',

  ui: {
    popup: {
      tab: {
        label: 'AI Scan',
        icon: 'Scan',
        order: 2,
        requiresTab: true,
      },
      component: () => import('./components/PopupTab'),
    },
    options: {
      panel: {
        label: 'Template Management',
        icon: 'Scan',
        section: 'features',
        order: 2,
      },
      component: () => import('./components/OptionsPanel'),
    },
  },

  handlers: {
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
    }
  },

  init: () => console.log('[AI-Scan] Feature loaded successfully'),
};

export default config;