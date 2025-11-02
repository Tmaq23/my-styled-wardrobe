'use client';

import { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertImage = () => {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Show loading state
      const loadingText = document.createTextNode('Uploading image...');
      document.execCommand('insertHTML', false, '<span class="uploading">Uploading...</span>');
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.url) {
          // Remove loading text
          const uploadingSpans = editorRef.current?.querySelectorAll('.uploading');
          uploadingSpans?.forEach(span => span.remove());
          
          // Insert the image
          execCommand('insertImage', data.url);
        } else {
          alert(data.error || 'Failed to upload image');
          // Remove loading text
          const uploadingSpans = editorRef.current?.querySelectorAll('.uploading');
          uploadingSpans?.forEach(span => span.remove());
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        // Remove loading text
        const uploadingSpans = editorRef.current?.querySelectorAll('.uploading');
        uploadingSpans?.forEach(span => span.remove());
      }
    };
    
    input.click();
  };
  
  const insertImageFromURL = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div style={{
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.08)'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        flexWrap: 'wrap',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          style={toolbarButtonStyle}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          style={toolbarButtonStyle}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          style={toolbarButtonStyle}
          title="Underline"
        >
          <u>U</u>
        </button>
        
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.25rem' }} />
        
        {/* Headings */}
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h1>')}
          style={toolbarButtonStyle}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          style={toolbarButtonStyle}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h3>')}
          style={toolbarButtonStyle}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<p>')}
          style={toolbarButtonStyle}
          title="Paragraph"
        >
          P
        </button>
        
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.25rem' }} />
        
        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          style={toolbarButtonStyle}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          style={toolbarButtonStyle}
          title="Numbered List"
        >
          1. List
        </button>
        
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.25rem' }} />
        
        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          style={toolbarButtonStyle}
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          style={toolbarButtonStyle}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          style={toolbarButtonStyle}
          title="Align Right"
        >
          →
        </button>
        
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.25rem' }} />
        
        {/* Insert */}
        <button
          type="button"
          onClick={insertLink}
          style={toolbarButtonStyle}
          title="Insert Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={insertImage}
          style={toolbarButtonStyle}
          title="Upload Image"
        >
          📤 Upload
        </button>
        <button
          type="button"
          onClick={insertImageFromURL}
          style={toolbarButtonStyle}
          title="Insert Image from URL"
        >
          🖼️ URL
        </button>
        
        <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.25rem' }} />
        
        {/* Quote */}
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          style={toolbarButtonStyle}
          title="Quote"
        >
          &quot; Quote
        </button>
        
        {/* Code */}
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<pre>')}
          style={toolbarButtonStyle}
          title="Code Block"
        >
          &lt;/&gt; Code
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: '400px',
          padding: '1.5rem',
          outline: 'none',
          color: 'white',
          fontSize: '1.05rem',
          lineHeight: '1.8',
          overflowY: 'auto',
          maxHeight: '600px'
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.4);
        }
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.875rem 0;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #a78bfa;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.9);
        }
        [contenteditable] pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: 'Courier New', monospace;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] a {
          color: #a78bfa;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

const toolbarButtonStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: '500',
  transition: 'background 0.2s',
};

