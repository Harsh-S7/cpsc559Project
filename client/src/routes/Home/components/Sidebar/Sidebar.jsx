import React from 'react'
import { Input, Avatar, IconButton, Stack, Button, Box, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons'
import Icon from '@mdi/react'
import { mdiHistory, mdiCog, mdiFolderAccount, mdiFolder } from '@mdi/js'
import { useNavigate } from 'react-router-dom'

import './Sidebar.scss'

const buttonsText = [
    "Recents",
    "My Documents",
    "Shared with me",
]

const buttonsIcons = [
    mdiHistory,
    mdiFolder,
    mdiFolderAccount, 
]

const Sidebar = (props) => {
    const navigate = useNavigate()

    const handleMinimize = () => {
        props.setIsSidebarOpen(!props.isSidebarOpen)
    }

    return (
      <div className={`sidebar-layout ${!props.isSidebarOpen ? 'minimized' : ''}`}>
          {props.isSidebarOpen ? (
            <div className='quick-access-container'>
                <Menu>
                    <MenuButton as={Avatar} className='avatar'
                        bg={'#7F6BFF'}
                        name={localStorage.getItem('name') ? localStorage.getItem('name') : ''}
                    />
                    <MenuList>
                        <MenuItem
                            onClick={() => {
                                localStorage.clear()
                                navigate('/signin')
                            }}
                        >
                            Log out
                        </MenuItem>
                    </MenuList>
                </Menu>
                <Input
                    className='input-search'
                    placeholder='Search notes & quizzes'
                    variant='filled'
                />
                <IconButton
                    className='close-icon'
                    aria-label='Collapse Side Menu'
                    icon={<ArrowLeftIcon outline={'none'}/>}
                    onClick={handleMinimize}
                    bg={'transparent'}
                    color={'gray'}
                    _hover={{borderColor: 'transparent'}}
                    _focus={{outline: 'none'}}
                />
            </div>
          ) : (
            <div className='quick-access-container'>
                <IconButton
                    className='close-icon'
                    aria-label='Collapse Side Menu'
                    icon={<ArrowRightIcon outline={'none'}/>}
                    onClick={handleMinimize}
                    bg={'transparent'}
                    color={'gray'}
                    _hover={{borderColor: 'transparent'}}
                    _focus={{outline: 'none'}}
                />
            </div>
          )}
          <div className='menu-container'>
              <Stack className='buttons-group' gap={0}>
                  { props.isSidebarOpen ?
                      buttonsText.map((text, index) => {
                          return (
                              <Button
                                  className='menu-button'
                                  onClick={() => {
                                      props.setCurrentTab(text)
                                      navigate('/home')
                                  }}
                                  variant='ghost'
                                  _hover={{borderColor: 'transparent'}}
                                  _focus={{outline: 'none'}}
                                  isActive={props.currentTab === text}
                                  _active={{bg: '#f5f5f5', fontWeight: 'bold'}}
                                  value={text}
                              >
                                  {text}
                              </Button>
                          )
                      }) : 
                      buttonsIcons.map((icon, index) => {
                          return (
                              <IconButton
                                  className='menu-button icon'
                                  aria-label='Menu Button'
                                  icon={<Icon path={icon} size={1} color="black"/>}
                                  onClick={() => {
                                      props.setCurrentTab(buttonsText[index])
                                      navigate('/home')
                                  }}
                                  bg={'transparent'}
                                  color={'gray'}
                                  _hover={{borderColor: 'transparent'}}
                                  _focus={{outline: 'none'}}
                                  isActive={props.currentTab === buttonsText[index]}
                                  _active={{bg: '#f5f5f5'}}
                              />
                          )
                      })
                    
                  }
              </Stack>
          </div>
            <div className='settings-container'>
              {props.isSidebarOpen &&
              (
              <Box className='account-info-box'>
                  <Avatar
                      className='avatar'
                      bg={'#7F6BFF'}
                      name={localStorage.getItem('name') ? localStorage.getItem('name') : '?'}
                      onClick={() => console.log('clicked')}
                  />
                  <Stack className='account-info' spacing='1px'>
                        <div className='account-name'>
                            {localStorage.getItem('name') ? localStorage.getItem('name') : 'User Name'}
                            <span className='account-coin-count'>&nbsp;&nbsp;	&#40;{localStorage.coin} coins&#41;</span>
                        </div>
                        <div className='account-username'>
                            {`@${localStorage.getItem('username') ? localStorage.getItem('username') : 'username'}`}
                        </div>
                  </Stack>
              </Box>
              )}
              <Menu>
                    <MenuButton as={Icon} path={mdiCog} size={1} color={'grey'} className={`settings-button ${!props.isSidebarOpen ? 'minimized' : ''}`} />
                    <MenuList>
                        <MenuItem
                            onClick={() => {
                                localStorage.clear()
                                navigate('/signin')
                            }}
                        >
                            Log out
                        </MenuItem>
                    </MenuList>
                </Menu>
            </div>
      </div>
    )
}

export default Sidebar