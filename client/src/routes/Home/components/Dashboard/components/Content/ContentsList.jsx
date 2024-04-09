import React from 'react'
import { Skeleton, Stack, StackDivider, VStack, Box, Grid, GridItem, Divider, Menu, MenuButton, MenuList, MenuItem, IconButton, Input } from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { useNavigate } from 'react-router-dom'
import { useToast, useDisclosure } from '@chakra-ui/react';

import { deleteDocument, shareDocument } from '../../../../../../../lib/utils';

import './ContentsList.scss'

const ContentsList = (props) => {
  const navigate = useNavigate()
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [username, setUsername] = React.useState('');
  const [usernames, setUsernames] = React.useState([]);
  const [sharingDocumentId, setSharingDocumentId] = React.useState('');

  const handleDeleteDocument = async (documentId) => {
    const response = await deleteDocument(documentId);
    if (response instanceof Error) {
      console.error(response);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the document',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    console.log(response);
    toast({
      title: 'Document Deleted',
      description: 'Your document has been deleted successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    props.fetchDocuments();
  }

  const handleShareDocument = async (documentId) => {
    const response = await shareDocument(documentId, usernames);
    if (response instanceof Error) {
      console.error(response);
      toast({
        title: 'Error',
        description: 'An error occurred while sharing the document',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    console.log(response);
    toast({
      title: 'Document Shared',
      description: 'Your document has been shared successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }

  const shareModal = (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share with people</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <Input placeholder='Add username to share' size='md' value={username} onChange={(event) => setUsername(event.target.value)} style={{marginRight: '10px'}}/>
              <Button onClick={() => {
                setUsernames([...usernames, username]);
                setUsername('');
              
              }}>Add</Button>
            </div>
            <Divider style={{margin: '10px 0'}} />
            <div style={{ fontWeight: "600", marginBottom: "1rem" }}>Share with:</div>
            <VStack align='stretch' spacing={1} >
              {usernames.map((username) => (
                <Box>- {username}</Box>
              ))}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='brand' mr={3} onClick={() => {
              handleShareDocument(sharingDocumentId);
              onClose();
            }}>
              Share
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  )

  const documentItem = (document) => {
    return (
      <Box
        className='document-item'
        key={document.id}
        
      >
        <Grid templateColumns='repeat(6, 1fr)' gap={6}>
          <GridItem colSpan={5} onClick={() => navigate(`/editor/${document.id}`)}>
            <Stack spacing={0} className='document-item-content'>
              <Box className='document-item-name'>{document.name}</Box>
              <Box className='document-item-last-opened'>Owner: {document.owner}</Box>
            </Stack>
          </GridItem>
          <GridItem style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box className='document-item-actions'>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label='Options'
                  icon={<Icon path={mdiDotsVertical} size={1} />}
                  variant='ghost'
                />
                <MenuList>
                  <MenuItem icon={<AddIcon />} onClick={() => {
                    setSharingDocumentId(document.id);
                    onOpen();                  
                  }}>
                    Share
                  </MenuItem>
                  <MenuItem icon={<EditIcon />} >
                    Rename
                  </MenuItem>
                  <MenuItem icon={<DeleteIcon />} onClick={() => handleDeleteDocument(document.id)}>
                    Delete File
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    )
  }

  return (
    <div className='contents-list-container'>
      <Box className='stack-title'>
          <Grid templateColumns='repeat(6, 1fr)' gap={6}>
            <GridItem colSpan={5}>
              <Stack spacing={0} divider={<StackDivider borderColor='gray.200' />} className='document-item-content'>
                <Box className='document-item-name'>Document Name</Box>
              </Stack>
            </GridItem>
          </Grid>
        </Box>
      <Divider className='title-divider' borderWidth='2px' borderColor='black' />
      <VStack align='stretch' spacing={4} divider={<StackDivider border='gray.200' />}>
        
        {props.documents.map((document) => documentItem(document))}
      </VStack>
      {shareModal}
    </div>
  )
}

export default ContentsList