import React, { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom'; // Import useParams

const SharedDocumentComponent = () => {
  // Use useParams to directly extract URL parameters
  const { docId } = useParams();
  const docName = docId || 'defaultDoc'; // Use docId from URL or default
  const [doc, setDoc] = useState(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    // Initialize Y.Doc
    const ydoc = new Y.Doc();
    const wsProvider = new WebsocketProvider('ws://localhost:3000', docName, ydoc);

    // Initialize shared types (e.g., Y.Text)
    const ytext = ydoc.getText('sharedText');
    setDoc(ydoc); // Save Y.Doc for further use

    // Listen to changes in the shared text
    ytext.observe(event => {
      setContent(ytext.toString());
    });

    // Initial content update
    setContent(ytext.toString());

    // Clean up on component unmount
    return () => {
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [docName]); // Dependency array includes docName

  // Function to update the shared document, e.g., on user input
  const updateDocument = (newContent) => {
    if (doc) {
      const ytext = doc.getText('sharedText');
      ytext.delete(0, ytext.length);
      ytext.insert(0, newContent);
    }
  };

  return (
    <div>
      <h2>Shared Document: {docName}</h2>
      <textarea
        value={content}
        onChange={(e) => updateDocument(e.target.value)}
        style={{ width: '100%', height: '200px' }}
      />
    </div>
  );
};

export default SharedDocumentComponent;
