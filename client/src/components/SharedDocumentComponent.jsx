import React, { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';

import { getDocumentById } from '../../lib/utils';

import './SharedDocumentComponent.scss';

const SharedDocumentComponent = () => {
    const { docId } = useParams();
    const [docName, setDocName] = useState('');
    const [doc, setDoc] = useState(null);
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchDocument = async () => {
            const response = await getDocumentById(docId);
            if (response instanceof Error) {
                console.error(response);
            }
            console.log (response);
            setDocName(response.name);
        };

        fetchDocument();
    },[]);

    useEffect(() => {
        const ydoc = new Y.Doc();
        console.log('Connecting to document:', docName);
        const wsProvider = new WebsocketProvider(import.meta.env.VITE_WEBSOCKET_URL, docName, ydoc);
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
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', background: '#0D1117', width: "100%", height: "fit-content", color: "white", padding: "2rem" }}>Document: {docName}</h2>
      <MDEditor
        className='markdown-editor'
        value={content}
        onChange={updateDocument}
        style={{ width: '100%', minHeight: '100vh', padding: '10px' }}
      />
      <MDEditor.Markdown source={content} style={{ whiteSpace: 'pre-wrap', display: 'none' }} />
    </div>
  );
};

export default SharedDocumentComponent;
