import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link'],
  [{ align: [] }],
  ['clean'],
];

export default function RichTextEditor({ value, onChange, placeholder, readOnly }) {
  const modules = useMemo(
    () => ({ toolbar: readOnly ? false : TOOLBAR }),
    [readOnly]
  );

  return (
    <ReactQuill
      theme="snow"
      value={value || ''}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{ minHeight: 280 }}
    />
  );
}
