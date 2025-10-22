import { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

export interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string
}

export function Anchor({ className = "", ...props }: AnchorProps) {
    return (
        <Link {...props} className={'text-primary hover:underline ' + className} />
    )
}