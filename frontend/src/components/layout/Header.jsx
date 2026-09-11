import { useAuth } from "../../context/AuthContext";

const Header = () => {
    const { user } = useAuth();

    return (
        <header className="header">
            <div>
                <h1>Dashboard</h1>
                <p>Welcome back, {user?.username}</p>
            </div>

            <div className="header-user">
                <strong>{user?.username}</strong>
                <span>{user?.role}</span>
            </div>
        </header>
    );
};

export default Header;