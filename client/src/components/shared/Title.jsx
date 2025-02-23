import React from 'react'

const Title = ({title,description}) => {
  return (
    <>
    <title>{title}</title>
    <meta name="description" content={description} />
    </>
  )
}

export default Title