// src/pages/Error.jsx
import { Link } from 'react-router-dom'

export default function Error({ code, url=null, link='/', redirect='Back to homepage' }) {
    const message = {
        307: 'Page has temporarily been moved to',
        308: 'Page has permanently been moved to',
        400: 'Request cannot be filled due to bad syntax',
        401: 'Authentication required',
        402: 'Payment required',
        403: 'Access denied',
        404: 'Page not found',
        500: 'Internal server error'
    };

    return (
        <article className='error-page'>
            <section>
                <h1>Error {code}</h1>
                <p>{message[code]}</p>
                {url  && <a href={url}>{redirect??url}</a>}
                {link && <Link to={link}>{redirect??link}</Link>}
            </section>
        </article>
    );
}