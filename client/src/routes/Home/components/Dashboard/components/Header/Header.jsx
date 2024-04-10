import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'

import './Header.scss'

// Header component of the Dashboard
const Header = (props) => {

  return (
    <div className='dashboard-header'>
      <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />}>
        <BreadcrumbItem>
          <BreadcrumbLink className='breadcrumb-link' href='#'>{props.currentTab}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Button className='import-btn' colorScheme='brand' onClick={props.onOpen}>
          New Document
      </Button>
    </div>
  )
}

export default Header