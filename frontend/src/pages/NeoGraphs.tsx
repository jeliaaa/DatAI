import Neo4jGraphMock from "../components/NeoGraph";
import PageHeader from "../components/UI/PageHeader";
const NeoGraphs = () => {
    return (
        <div className="min-h-screen bg-white text-main-color p-4 sm:p-6 md:p-8 font-sans">
            <PageHeader heading="Neo4j Graphs" />
            <div>
                <Neo4jGraphMock />
            </div>
        </div>
    )
}

export default NeoGraphs
