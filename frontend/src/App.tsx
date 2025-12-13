import { Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { publicRoutes } from "./routes/publicRoutes"
import CustomOutlet from "./components/UI/CustomOutlet"
import Loader from "./components/UI/Loader"
// import Loader from "./components/reusables/Loader"

function App() {
  return (
    <div className="relative">
      {/* <Link to={'/chat'} className="fixed z-50 right-5 md:bottom-5 bottom-20 w-20 aspect-square rounded-full flex justify-center items-center bg-gray-100 shadow-2xl cursor-pointer hover:-translate-y-2 transition-all">
        <Robot fontSize={40} />
      </Link> */}
      <Suspense fallback={<div><Loader /></div>}>
        <Routes>
          <Route element={<CustomOutlet />}>
            {publicRoutes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
