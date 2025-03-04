import Title from "../shared/Title";
import { SidebarProvider } from "../ui/sidebar";
import Header from "./Header";
import {SideBar} from "./SideBar";


const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {
        return (
            <>
                <Title />
                <Header />
                <div className="grid grid-cols-4 gap-4 max-h-[calc(100vh-4rem)]">
                    <div className="first hidden md:inline-block md:col-span-1 h-[calc(100vh-4rem)] ">
                        <SidebarProvider>
                        <SideBar />
                        </SidebarProvider>
                    </div>
                    <div className="col-span-3">
                        <WrappedComponent {...props} />
                    </div>
                    <div className="">

                    </div>
                </div>
            </>
        )
    }
    WithLayout.displayName = `WithLayout(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithLayout;
}
export default AppLayout