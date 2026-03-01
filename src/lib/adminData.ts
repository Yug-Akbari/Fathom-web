export type LeadStatus = "New" | "Contacted" | "Pending" | "Resolved";
export type LeadSource = "WhatsApp" | "Web Form" | "Showroom";
export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    company?: string;
    location: string;
    source: LeadSource;
    date: string;
    status: LeadStatus;
    message: string;
    interestedProductIds: string[];
}

export interface AdminProduct {
    id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    stockCount: number;
    stockStatus: StockStatus;
    isFeatured: boolean;
    isActive: boolean;
    createdAt?: string;
    salesVolume: number;
    views: number;
}

export const mockLeads: Lead[] = [
    {
        id: "L-1001",
        name: "Elena Sterling",
        email: "elena@sterlingarch.com",
        phone: "+1 (212) 555-0199",
        role: "Architect",
        company: "Sterling Architecture",
        location: "New York, NY",
        source: "WhatsApp",
        date: "Oct 24, 10:23 AM",
        status: "New",
        message: "Hello FATHOM team,\n\nWe are currently specifying appliances for a penthouse renovation in Tribeca. My client is very interested in the Obsidian Series, specifically the range and refrigeration units.\n\nI would like to request the detailed spec sheets and also inquire about trade pricing for a bulk order. Could we schedule a call to discuss the timeline?\n\nBest regards,\nElena",
        interestedProductIds: ["P-1001"]
    },
    {
        id: "L-1002",
        name: "Marcus Kane",
        email: "marcus.kane@devcorp.com",
        phone: "+1 (555) 123-4567",
        role: "Developer",
        company: "Kane Development",
        location: "Los Angeles, CA",
        source: "Web Form",
        date: "Oct 24, 09:15 AM",
        status: "Contacted",
        message: "Looking for 12 units of the built-in coffee system for a new boutique condo project.",
        interestedProductIds: ["P-1004"]
    },
    {
        id: "L-1003",
        name: "James Dewitt",
        email: "james@dewitthomes.com",
        phone: "+1 (312) 555-8888",
        role: "Homeowner",
        location: "Chicago, IL",
        source: "Showroom",
        date: "Oct 23, 04:45 PM",
        status: "Pending",
        message: "Visited the Fulton Market showroom. Need measurements confirmed for the 48-inch range.",
        interestedProductIds: ["P-1001"]
    },
    {
        id: "L-1004",
        name: "Sarah Jenkins",
        email: "s.jenkins@studio8.com",
        phone: "+1 (555) 987-6543",
        role: "Designer",
        company: "Studio 8",
        location: "Miami, FL",
        source: "Web Form",
        date: "Oct 23, 02:10 PM",
        status: "Contacted",
        message: "Updating a beachfront property. Looking for wine preservation columns.",
        interestedProductIds: ["P-1005"]
    }
];


export const dashboardStats = {
    totalLeads: { value: 1248, trend: "+12%" },
    productViews: { value: "45.2K", trend: "+8.4%" },
    conversionRate: { value: "3.8%", trend: "-0.5%" },
    systemStatus: {
        uptime: "99.98%",
        apiResponse: "45ms",
        dbLoad: "12%"
    }
};
