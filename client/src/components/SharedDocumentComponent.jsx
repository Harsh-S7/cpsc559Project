import React, { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';

import { getDocumentById } from '../../lib/utils';

import './SharedDocumentComponent.scss';

const SharedDocumentComponent = () => {
    // useParams is a hook provided by react-router-dom to access the parameters of the current route. 
    // In this case, we are accessing the docId parameter from the route '/editor/:docId'
    const { docId } = useParams();

    // state variables to manage the document name, the document object, and the content of the document
    const [docName, setDocName] = useState('');
    const [doc, setDoc] = useState(null);
    const [content, setContent] = useState('');

    // useEffect hook to fetch the document by the docId
    // The document name is set in the state variable docName
    // fetchDocument function is called only once when the component is mounted.
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

    // useEffect hook to connect to the shared document using Yjs
    // The document name is used to connect to the shared document
    // The content of the document is updated whenever there is a change in the shared document
    useEffect(() => {
        if (docName === '') return;
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

    // function to update the content of the shared document
    const updateDocument = (newContent) => {
        if (doc) {
            const ytext = doc.getText('sharedText');
            ytext.delete(0, ytext.length);
            ytext.insert(0, newContent);
            console.log('Document updated:', newContent)
        }
    };

    // render the components
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          background: '#0D1117', 
          width: "100%", 
          height: "fit-content", 
          color: "white", 
          padding: "2rem", 
          display: "flex",
          justifyContent: "space-between" // Add this line
      }}>
          <h2>
            Document: {docName}
          </h2>
          <div style={{ alignSelf: "flex-end", fontSize: '18px', fontWeight: 'normal' }}>
            @{localStorage.getItem('username')}
          </div>
      </div>
      
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
