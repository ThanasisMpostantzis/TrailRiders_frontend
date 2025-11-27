import axios from "axios";

const BASE_URL = "http://192.168.1.2:8000/rides"; 

export interface Ride {
    id: number;
    organizer: string;
    title: string;
    usersId: string[];
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
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
}

export interface RideCreation {
    organizer: string;
    title: string;
    usersId: string[];
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
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
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

// ✅ ΣΩΣΤΟ: Χρησιμοποιούμε το RideCreation
export async function createRideApi(rideData: RideCreation) {
    try {
        const res = await axios.post(`${BASE_URL}/createRide`, rideData);
        return res.data;
    } catch (err: any) {
        console.log("Error creating ride:", err);
        throw err.response?.data || err.message;
    }
}