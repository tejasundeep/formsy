import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";

// Define the initial values for the LayoutContext
const initialContextValue = {
    user: null,
    loggedinStatus: "unauthenticated", // Consider adding a default status
};

// Create the LayoutContext with the initial values
const LayoutContext = createContext(initialContextValue);

// The LayoutProvider component supplies the LayoutContext values to its children
export const LayoutProvider = ({ children }) => {
    const { data: session, status: loggedinStatus } = useSession();

    // Determine the user value based on the authentication status
    const user = loggedinStatus === "authenticated" ? session?.user : null;

    // Memoize the context values to optimize performance and prevent unnecessary re-renders
    const contextValue = useMemo(
        () => ({ user, loggedinStatus }),
        [user, loggedinStatus]
    );

    return (
        <LayoutContext.Provider value={contextValue}>
            {children}
        </LayoutContext.Provider>
    );
};

// Custom hook to access the LayoutContext values
export const useLayoutContext = () => useContext(LayoutContext);
