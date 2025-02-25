import React from 'react';

const VisuallyHiddenInput = ({ type, ...props }) => {
    return (
        <input 
        className='file-input file-input-ghost'
            type={type}
            style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                border: '0',
                whiteSpace: 'nowrap',
              
            }}
            {...props}
        />
    );
};

export default VisuallyHiddenInput;