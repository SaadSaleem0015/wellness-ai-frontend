export function isUserRole():boolean {
    const role  = localStorage.getItem("role");
    // console.log("Role from local storage:", role); 
    return role === "user"
    
}

export function isSalesPersonHaveToChangeThePassword():boolean {
    const change_password_on_login  = localStorage.getItem("change_password_on_login");
    return change_password_on_login === 'true'
}