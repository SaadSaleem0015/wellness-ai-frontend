import { TbLoader } from "react-icons/tb";

export function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <div className="animate-spin text-4xl text-primary">
                <TbLoader />
            </div>
        </div>
    );
}

export function Loading2() {
    return (
        <div className="flex items-center justify-center bg-opacity-50">
            <div className="animate-spin text-4xl text-primary">
                <TbLoader />
            </div>
        </div>
    );
}




