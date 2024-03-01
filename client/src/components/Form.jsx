import React from 'react'
import { useState } from 'react'
import { Textarea, Button, Input } from '@chakra-ui/react'

import * as utils from '../../lib/utils'

import './Form.scss'

const Form = () => {
    const [string, setString] = useState('')
    const [inputString, setInputString] = useState('')
    const [index, setIndex] = useState('')
    const [startIndex, setStartIndex] = useState('')
    const [endIndex, setEndIndex] = useState('')
  
    const handleGetString = async (e) => {
      e.preventDefault()
      const newString = await utils.getString()
      setString(newString)
    }

    const handleInsertString = async (e) => {
        e.preventDefault()
        const newString = await utils.insertString(index, inputString)
        setString(newString)
    }

    const handleRemoveString = async (e) => {
        e.preventDefault()
        const newString = await utils.removeString(startIndex, endIndex)
        setString(newString)
    }

  
    return (
      <div className='form-container'>
        <div className='text-area-container'>
          <Textarea
            className='text-area'
            size="lg"
            value={string}
            isReadOnly
          />
        </div>
        <div className='form'>
          <div className='insert-string'>
            <div>Insert String</div>
            <Input
              placeholder='String to input'
              size={'md'}
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
            />
            <Input
              placeholder='Index'
              value={index}
              onChange={(e) => setIndex(e.target.value)}
            />
            <Button onClick={handleInsertString}>
              Insert String
            </Button>
          </div>
          <div className='remove-string'>
            <div>Remove String</div>
              <Input
                placeholder='Start index'
                size={'md'}
                value={startIndex}
                onChange={(e) => setStartIndex(e.target.value)}
              />
              <Input
                placeholder='End index'
                value={endIndex}
                onChange={(e) => setEndIndex(e.target.value)}
              />
              <Button onClick={handleRemoveString}>
                Remove String
              </Button>
          </div>
          <div className='get-string'>
            <Button onClick={handleGetString}>
              Get String
            </Button>
          </div>
        </div>
      </div>
    )
}

export default Form