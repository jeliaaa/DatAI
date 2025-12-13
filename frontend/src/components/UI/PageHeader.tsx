
type Props = {
    heading: string
}

const PageHeader = (props: Props) => {
    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-main-color">{props.heading}</h1>
            </div>
            <hr />
        </>
    )
}

export default PageHeader