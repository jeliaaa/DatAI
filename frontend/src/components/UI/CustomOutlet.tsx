import { Outlet } from "react-router-dom"
import Navigation from "./Navigation"

function CustomOutlet() {


    return (
        <div className='w-full min-h-dvh items-center justify-center flex relative bg-white'>
            <Navigation />
            <div className="w-full md:w-[95dvw] md:ml-[5dvw] pb-30 md:pb-0">
                <Outlet />
            </div>
        </div>
    )
}

export default CustomOutlet