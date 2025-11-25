import axios from "axios";

const BASE_URL = "http://10.232.202.179:8000/rides";
 
export interface Ride {
    id: number;
    organizer: string;
    title: string;
    joinedRiders: string[];
    image: string;
    rideDistance: number;
    startLocation: string;
    finishLocation: string;
    date: string;
    status: string;
    category: string;
    description: string;
    stops: string[];
    difficulty: string;
    rideType: string;
    expectedTime: number;
}

export async function getAllRidesApi(): Promise<Ride[]> {
    try {
        const res = await axios.get(`${BASE_URL}/getAllRides`);
        return res.data;
    } catch (err: any) {
        console.log("Error fetching rides: ", err);
        throw err.response?.data || err.message;
    }
}

export async function getRideById(id : string) : Promise<Ride> {
    try {
        const res = await axios.get(`${BASE_URL}/get/${id}`);
        return res.data;
    } catch(err: any) {
        console.log("Error fetching ride ", "with id ", id, ": ", err);
        throw err.response?.data || err.message;
    }
}