
function BoldText({ children }) {
    return <span className='font-normal' style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '18px', fontWeight: 'normal' }}>{children}</span>
}

function ExText({ children, TopMargin }) {
    return <h4 className={`text-bodytext ${TopMargin ? 'mt-5' : ''}`}>{children}</h4>
}

export { BoldText, ExText }