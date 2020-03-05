import React, { useRef } from 'react'
import { NextPage } from "next"
import useForm from 'react-hook-form'
import { UsersService } from '../services/users'
import { Button, TextInput } from '../components'

const Pay = () => {

  return (
    <div className = 'w-full h-full bg-surface'>
      <div className='w-full h-screen max-w-xs mx-auto bg-surface flex items-center'>
        link returned here
      </div>
    </div>
  )

}

export default Pay

Pay.getInitialProps = async (ctx) => {
  ctx.res.setHeader('link', "<http://localhost:3000/payment-manifest.json>; rel=\"payment-method-manifest\"")

  return {}
}
