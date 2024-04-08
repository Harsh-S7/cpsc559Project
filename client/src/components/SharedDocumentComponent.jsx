import React, { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';


const SharedDocumentComponent = () => {
    const { docId } = useParams();
    const docName = docId || 'defaultDoc';
    const [doc, setDoc] = useState(null);
    const [content, setContent] = useState('');

    useEffect(() => {
        const ydoc = new Y.Doc();
        console.log('Connecting to document:', docName);
        const wsProvider = new WebsocketProvider(`ws://localhost:3050`, docName, ydoc);
        const ytext = ydoc.getText('sharedText');
        setDoc(ydoc);

        ytext.observe(event => {
            setContent(ytext.toString());
        });

        setContent(ytext.toString());

        return () => {
            wsProvider.destroy();
            ydoc.destroy();
        };
    }, [docName]);

    const updateDocument = (newContent) => {
        if (doc) {
            const ytext = doc.getText('sharedText');
            ytext.delete(0, ytext.length);
            ytext.insert(0, newContent);
            console.log('Document updated:', newContent)
        }
    };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Document Name: {docName}</h2>
      {/* <textarea
        value={content}
        onChange={(e) => updateDocument(e.target.value)}
        style={{ width: '95%', height: '400px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
      /> */}
      <MDEditor
        value={content}
        onChange={updateDocument}
        style={{ width: '95%', height: '1000px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      <MDEditor.Markdown source={content} style={{ whiteSpace: 'pre-wrap', display: 'none' }} />
    </div>
  );
};

export default SharedDocumentComponent;
