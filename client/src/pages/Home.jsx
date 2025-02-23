import AppLayout from '@/components/layout/AppLayout'

const Home = () => {
  return (
    <div className=''>Home</div>
  )
}

const WrappedHome = AppLayout()(Home)
export default WrappedHome