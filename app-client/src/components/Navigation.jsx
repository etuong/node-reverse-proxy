import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import RbacContext from "../rbac/RbacContext";

const Navigation = () => {
  const [activeId, setActiveId] = useState(0);
  const { isAllowed } = useContext(RbacContext);

  const links = [
    { href: "/", name: "Home" },
    { href: "/about", name: "About" },
  ];

  if (isAllowed) {
    links.push({ href: "/secret", name: "Secret" });
  }

  useEffect(() => {
    const pathname = window.location.pathname;
    setActiveId(links.findIndex((l) => l.href === pathname));
  }, []);

  return (
    <div className="nav">
      <ul>
        {links.map((link, index) => {
          return (
            <li key={index}>
              <Link
                to={`${link.href}`}
                className={activeId === index ? "active" : ""}
                onClick={() => setActiveId(index)}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Navigation;
