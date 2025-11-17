/**
 * Minimal XML parser for SBE schema files
 * 
 * This is a lightweight XML parser specifically designed for parsing SBE (Simple Binary Encoding)
 * XML schema files. It provides the essential functionality needed without external dependencies.
 */

interface XMLParserOptions {
    ignoreAttributes?: boolean;
    attributeNamePrefix?: string;
    parseAttributeValue?: boolean;
    isArray?: (tagName: string) => boolean;
}

interface XMLNode {
    [key: string]: any;
}

/**
 * Parse attribute value based on type
 */
function parseAttributeValue(value: string): string | number | boolean {
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '' && !isNaN(parseFloat(value))) {
        return num;
    }
    
    return value;
}

/**
 * Parse XML string into a JavaScript object
 */
export class XMLParser {
    private options: Required<XMLParserOptions>;
    
    constructor(options: XMLParserOptions = {}) {
        this.options = {
            ignoreAttributes: options.ignoreAttributes ?? false,
            attributeNamePrefix: options.attributeNamePrefix ?? '@_',
            parseAttributeValue: options.parseAttributeValue ?? false,
            isArray: options.isArray ?? (() => false),
        };
    }
    
    parse(xml: string): any {
        // Remove XML declaration and comments
        xml = xml.replace(/<\?xml[^>]*\?>/g, '');
        xml = xml.replace(/<!--[\s\S]*?-->/g, '');
        
        // Remove CDATA sections (replace with content)
        xml = xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        
        const result = this.parseElement(xml.trim());
        return result;
    }
    
    private parseElement(xml: string): any {
        if (!xml || xml.trim() === '') {
            return {};
        }
        
        const result: XMLNode = {};
        let i = 0;
        
        while (i < xml.length) {
            // Skip whitespace
            while (i < xml.length && /\s/.test(xml[i])) {
                i++;
            }
            
            if (i >= xml.length) break;
            
            // Check for opening tag
            if (xml[i] === '<') {
                // Check for closing tag
                if (xml[i + 1] === '/') {
                    // Find the end of closing tag
                    const endIndex = xml.indexOf('>', i);
                    if (endIndex === -1) break;
                    i = endIndex + 1;
                    continue;
                }
                
                // Check for self-closing tag
                const selfClosingMatch = xml.substring(i).match(/^<([^/>\s:]+(?::[^/>\s]+)?)([^>]*)\s*\/>/);
                if (selfClosingMatch) {
                    const tagName = selfClosingMatch[1];
                    const attributes = this.parseAttributes(selfClosingMatch[2]);
                    const endIndex = i + selfClosingMatch[0].length;
                    
                    this.addToResult(result, tagName, {}, attributes);
                    i = endIndex;
                    continue;
                }
                
                // Parse opening tag
                const tagMatch = xml.substring(i).match(/^<([^>\s:]+(?::[^>\s]+)?)([^>]*)>/);
                if (!tagMatch) {
                    i++;
                    continue;
                }
                
                const tagName = tagMatch[1];
                const attributes = this.parseAttributes(tagMatch[2]);
                i += tagMatch[0].length;
                
                // Find matching closing tag
                const closingTag = `</${tagName}>`;
                let depth = 1;
                let contentStart = i;
                let contentEnd = i;
                
                while (i < xml.length && depth > 0) {
                    const nextClose = xml.indexOf(closingTag, i);
                    
                    if (nextClose === -1) {
                        // No closing tag found, treat as self-closing
                        break;
                    }
                    
                    // Check for nested opening tags with same name
                    const nextOpen = xml.indexOf(`<${tagName}`, i);
                    if (nextOpen !== -1 && nextOpen < nextClose) {
                        // Check if it's a self-closing tag
                        const selfCloseMatch = xml.substring(nextOpen).match(/^<[^>]+\s*\/>/);
                        if (selfCloseMatch) {
                            i = nextOpen + selfCloseMatch[0].length;
                            continue;
                        }
                        // It's a nested opening tag
                        depth++;
                        i = nextOpen + tagName.length + 2; // +2 for '<' and first char
                    } else {
                        // Found closing tag
                        depth--;
                        if (depth === 0) {
                            contentEnd = nextClose;
                            i = nextClose + closingTag.length;
                            break;
                        } else {
                            i = nextClose + closingTag.length;
                        }
                    }
                }
                
                // Extract content
                const content = xml.substring(contentStart, contentEnd).trim();
                
                // Check if content has child elements
                const hasChildElements = /<[^>]+>/.test(content);
                let childResult: any;
                
                if (hasChildElements) {
                    // Has nested elements, parse recursively
                    childResult = this.parseElement(content);
                } else if (content) {
                    // Text content only
                    childResult = content;
                } else {
                    childResult = {};
                }
                
                this.addToResult(result, tagName, childResult, attributes);
            } else {
                i++;
            }
        }
        
        return result;
    }
    
    private parseAttributes(attrString: string): Record<string, any> {
        const attrs: Record<string, any> = {};
        
        if (!attrString || attrString.trim() === '') {
            return attrs;
        }
        
        // Match attributes (name="value" or name='value')
        // Handle namespace prefixes like mbx:jsonValue
        const attrRegex = /([\w:]+)=["']([^"']*)["']/g;
        let match;
        
        while ((match = attrRegex.exec(attrString)) !== null) {
            const name = match[1];
            const stringValue = match[2];
            let value: string | number | boolean = stringValue;
            
            if (this.options.parseAttributeValue) {
                value = parseAttributeValue(stringValue);
            }
            
            const prefixedName = this.options.attributeNamePrefix + name;
            attrs[prefixedName] = value;
        }
        
        return attrs;
    }
    
    private addToResult(result: XMLNode, tagName: string, content: any, attributes: Record<string, any>): void {
        const shouldBeArray = this.options.isArray(tagName);
        
        // Handle text content - if content is a primitive and we have attributes, merge them
        let nodeValue: any;
        if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
            // Text content with attributes
            nodeValue = { ...attributes };
            // Store text content in a special key if there are attributes
            if (Object.keys(attributes).length > 0) {
                nodeValue['#text'] = content;
            } else {
                // No attributes, just use the text content
                nodeValue = content;
            }
        } else if (typeof content === 'object' && content !== null) {
            // Object content, merge attributes
            nodeValue = { ...content, ...attributes };
        } else {
            // Empty object, just use attributes
            nodeValue = attributes;
        }
        
        if (result[tagName] === undefined) {
            if (shouldBeArray) {
                result[tagName] = [nodeValue];
            } else {
                result[tagName] = nodeValue;
            }
        } else {
            // Convert to array if not already
            if (!Array.isArray(result[tagName])) {
                result[tagName] = [result[tagName]];
            }
            result[tagName].push(nodeValue);
        }
    }
}

