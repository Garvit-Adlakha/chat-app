import React from 'react'
import Title from '../shared/Title'
import { AppSidebar } from '../shared/SideBar'

const AppLayout = () => {
    return (WrappedComponent) => {
        const WithAppLayout = (props) => {
            return (
                <>
                    <Title title='Chat App' description='Chat App' />
                    <main>
                    <div className='grid grid-cols-1 md:grid-cols-4 mt-6'> {/* Responsive grid */}
                        <div className='col-span-1'> {/* Sidebar */}
                            <AppSidebar />
                        </div>
                        <div className='col-span-1 md:col-span-3'> {/* Main content area */}
                            <WrappedComponent {...props} />
                        </div>
                    </div>
                    </main>
                 
                </>
            )
        }
        
        WithAppLayout.displayName = `WithAppLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
        return WithAppLayout
    }
}

export default AppLayout
