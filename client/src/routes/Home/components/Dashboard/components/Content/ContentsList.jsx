import React from 'react'
import { Skeleton, Stack, StackDivider, VStack, Box, Grid, GridItem, Divider, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react'
import { HamburgerIcon, AddIcon, ExternalLinkIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { useNavigate } from 'react-router-dom'

import './ContentsList.scss'

const contents = [
  {
    lastOpened: '2 days ago',
    name: 'PHYS 259 Notes',
    contentId: '1'
  },
  {
    lastOpened: '5 days ago',
    name: 'SENG 513 Week 1 Notes',
    contentId: '2'
  },
  {
    lastOpened: '1 week ago',
    name: 'CPSC 559 Meeting notes',
    contentId: '3'
  },
]

const ContentsList = (props) => {
  const navigate = useNavigate()
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
              <Box className='document-item-last-opened'>Last opened: 1 day ago</Box>
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
                  <MenuItem icon={<AddIcon />}>
                    Share
                  </MenuItem>
                  <MenuItem icon={<EditIcon />} >
                    Rename
                  </MenuItem>
                  <MenuItem icon={<DeleteIcon />} >
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
    </div>
  )
}

export default ContentsList