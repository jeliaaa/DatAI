import React from "react";

interface MongoDocument {
    _id: string;
    x: number;
    y: number;
    createdAt: string;
    __v: number;
}

interface TableProps {
    data: MongoDocument[];
}

const MongoTable: React.FC<TableProps> = ({ data }) => {
    if (!data || data.length === 0) return <div>No data available</div>;

    const headers = Object.keys(data[0]) as (keyof MongoDocument)[];

    return (
        <table className="border-collapse border border-gray-300 w-full text-sm">
            <thead>
                <tr>
                    {headers.map((h) => (
                        <th key={h} className="border p-2 bg-gray-100">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i}>
                        {headers.map((h) => (
                            <td key={h} className="border p-2">
                                {row[h]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MongoTable;
