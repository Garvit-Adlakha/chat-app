import Title from "../shared/Title";
import { SidebarProvider } from "../ui/sidebar";
import Header from "./Header";
import {SideBar} from "./SideBar";


const AppLayout = () => (WrappedComponent) => {
    const WithLayout = (props) => {
        return (
            <>
                <Title />
                <div className="grid grid-cols-4 max-h-[calc(100vh-4rem)] mt-4 h-full">
                    <div className="hidden md:inline-block md:col-span-1 h-full ">
                        <SidebarProvider>
                        <SideBar />
                        </SidebarProvider>
                    </div>
                <div className="col-span-3 h-full mr-3">
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