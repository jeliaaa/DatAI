import PageHeader from "../components/UI/PageHeader"
import SchemaGraph from "../components/ReactGraphs"

const TextToScheme = () => {
    return (
        <div className="min-h-screen bg-white text-main-color p-4 sm:p-6 md:p-8 font-sans">
            <PageHeader heading="Text To Scheme" />
            <div>
                <SchemaGraph />
            </div>
        </div>
    )
}

export default TextToScheme