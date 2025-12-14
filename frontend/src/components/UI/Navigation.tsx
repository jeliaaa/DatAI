import { Link, useLocation } from "react-router-dom";
import qtdb from '../../assets/icons/QtDb.svg?react'
import tts from '../../assets/icons/db-schemes.svg?react'
import graph from '../../assets/icons/graph.svg?react'
import logo from "../../assets/logo.png"

const Navigation = () => {
  const { pathname } = useLocation();

  const navigationList = [
    { to: "/", name: "Query To Database", Icon: qtdb },
    { to: "/text-to-scheme", name: "Text to Scheme", Icon: tts },
    { to: "/neo4j-graphs", name: "Neo4j Graphs", Icon: graph }
  ];
  const isActive = (to: string) => pathname.endsWith(to);
  return (
    <>
      {/* Sidebar for desktop */}
      <div className="top-0 left-0 h-screen w-[5dvw] bg-main-color text-white z-50 flex-col items-center py-4 gap-6 hidden md:fixed md:flex">
        <Link to="/">
          <img src={logo} className="w-12" alt="Logo" />
        </Link>

        <hr className="w-[80%] border-2 border-primary-color my-4" />

        {navigationList.map(({ Icon, name, to }) => (
          <Link key={to} to={to} className="relative group w-fit z-50">
            <Icon
              className={`w-12 h-12 object-center ${name != 'Neo4j Graphs' && "mr-2"} trans1ition-colors duration-200 ${isActive(to) ? "fill-texts-color" : "fill-primary-color"
                }`}
            />
            <span className="hidden absolute left-12 top-1/2 transform -translate-y-1/2 bg-gray-700 text text-xs px-2 py-1 rounded z-50 group-hover:block ">
              {name}
            </span>
          </Link>
        ))}

        <div className="flex flex-col gap-y-5 absolute bottom-5 items-center">
          <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-white bg-white">
            {/* <img
              src={logo}
              className="w-10 h-10 rounded-full border-2 border-main-color"
              alt="Profile"
            /> */}
          </Link>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-gray-900 text-white flex justify-around py-4 md:hidden z-50">
        {navigationList.map(({ Icon, name, to }) => (
          <Link key={to} to={to} className="relative group">
            <Icon
              className={`w-8 h-8 flex items-center justify-center ${isActive(to)  ? "fill-primary-color" : "fill-primary-color"
                }`}
            />
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-1 bg-gray-700 text-white text-xs  px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {name}
            </span>
          </Link>
        ))}
        <Link to="/profile">
          <img
            src={logo}
            className="w-8 rounded-full border-2 border-main-color"
            alt="Profile"
          />
        </Link>
      </div>
    </>
  );
};

export default Navigation;
