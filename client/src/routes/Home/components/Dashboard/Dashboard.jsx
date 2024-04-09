import React from 'react'
import Header from './components/Header/Header'
import ContentsList from './components/Content/ContentsList'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input, 
  Button,
} from '@chakra-ui/react'
import { useDisclosure, useToast } from '@chakra-ui/react'

import './Dashboard.scss'

import { createNewDocument } from '../../../../../lib/utils'

const Dashboard = (props) => {
  const toast = useToast();
  const [documentName, setDocumentName] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleNewDocument = async () => {
    const response = await createNewDocument(documentName, localStorage.getItem('username'));
    if (response instanceof Error) {
      console.error(response);
    }
    console.log(response);
    toast({
      title: 'Document Created',
      description: 'Your new document has been created successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    props.fetchDocuments();
    setDocumentName('');
    onClose();
  }

  const newDocumentModal = (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter New Document Name</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder='Document Name' size='md' value={documentName} onChange={e => setDocumentName(e.target.value)}/>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={handleNewDocument} colorScheme='brand'>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  )

  return (
    <div className='dashboard-container'>
      <Header
        currentTab={props.currentTab}
        setCurrentTab={props.setCurrentTab}
        isSidebarOpen={props.isSidebarOpen}
        setIsSidebarOpen={props.setIsSidebarOpen}
        onOpen={onOpen}
      />
      <ContentsList documents={props.documents}/>
      {newDocumentModal}
    </div>
  )
}

export default Dashboard