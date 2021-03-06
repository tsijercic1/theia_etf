import { injectable } from "inversify";

export interface Task {
    taskNumber: number;
    name: string;
}

export interface PowerupType {
    id: number;
    name: string;
    price: number;
}

export interface UsedPowerup {
    name: string;
    taskNumber: number;
}

export interface Assignment {
    id: number;
    name: string;
    path: string;
    active: boolean;
    points: number;
    challenge_pts: number;
}

export interface TaskCategory {
    id: number;
    name: string;
    points_percent: number;
    tokens: number;
    tasks_per_category: number;
}

export interface AssignmentDetails {
    id: number;
    name: string;
    path: string;
    unlocked: boolean; 
    started: boolean;
    finished: boolean;
    tasksFullyFinished: number;
    tasksTurnedIn: number;
    previousPoints: number;
    points: number;
    currentTask: Task;
    taskHint: string;
    buyingPowerUp: boolean;
    powerupsUsed: UsedPowerup[];
    collapsed: boolean;
}

export interface StudentData {
    student: string;
    tokens: number;
    points: number;
    unusedPowerups: {name: string, amount: number}[];
    assignmentsData: AssignmentDetails[];
}

export interface ChallengeConfig {
    enoughPoints: number,
    noPowerups: number,
    maxPoints: number,
    maxPointsNoPowerups: number,
    tasksRequired: number
}

export interface PowerupResponse {
    success: boolean;
    message: string;
    powerupType: string;
    price: number;
    tokens: number;
}

export interface HintResponse {
    success: boolean;
    message: string;
    hint: string;
    tokens: number;
}

export interface SecondChanceResponse {
    success: boolean;
    message: string;
    taskData: {};
}

export interface ServerResponse {
    success: boolean;
    message: string;
    data: any;
}

export interface CourseInfo {
    id: string;
    name: string;
    abbrev: string;
    external: boolean;
}

@injectable()
export class GameService {
    
    private BASE_URL = "/services/uup_game.php?action="

    public async getAssignments() : Promise<Assignment[]> {
        let requestURL = this.BASE_URL +`getAssignments`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include"
        });
        let data = await res.json();
        return Promise.resolve(data.data);
    }

    public async getPowerupTypes() : Promise<PowerupType[]> {
        let requestURL = this.BASE_URL +`getPowerUpTypes`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include"
        });
        let data = await res.json();
        return Promise.resolve(data.data);
    }

    public async getChallengeConfig() : Promise<ChallengeConfig> {
        let requestURL = this.BASE_URL +`getChallengeConfig`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include"
        });
        let data = await res.json();
        return Promise.resolve(data.data);
    }

    public async getTaskCategories() : Promise<TaskCategory[]> {
        let requestURL = this.BASE_URL +`getTaskCategories`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include"
        });
        let data = await res.json();
        return Promise.resolve(data.data);
    }
    /*
    private async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    */

    private mapResponse(serverResponse: any) : ServerResponse  {
        let response = {
            success: false,
            message: "",
            data: {}
        };
        
        if(!serverResponse.success) {
            response = {
                success: serverResponse.success,
                message: Object.keys(serverResponse).includes('data') ? serverResponse.data.reason : serverResponse.message,
                data: serverResponse.data
            }
        }
        else response = {
            success: serverResponse.success,
            message: Object.keys(serverResponse).includes('data') ? serverResponse.data.message : serverResponse.message,
            data: serverResponse.data
        }
        return response;
    }

    public async buyPowerup(powerupType: PowerupType) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL + `buyPowerUp&type_id=${powerupType.id}`;
        let res = await fetch(requestURL, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data));
    }

    public async startAssignment(assignment: AssignmentDetails) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL +`startAssignment&assignment_id=${assignment.id}`;
        let res = await fetch(requestURL, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data));
    } 

    public async useHint(assignment: AssignmentDetails) : Promise<ServerResponse> {        
        let requestURL = this.BASE_URL + `hint&assignment_id=${assignment.id}`;
        let res = await fetch(requestURL, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data));
    }

    public async useSecondChance(assignment: AssignmentDetails, task: Task) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL + `secondChance&assignment_id=${assignment.id}`;
        let res = await fetch(requestURL, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                task_name: task.name,
                task_number: task.taskNumber
            })
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data));
    }

    public async switchTask(assignment: AssignmentDetails) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL + `swapTask&assignment_id=${assignment.id}`;
        let res = await fetch(requestURL, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data));
    }

    public async turnInTask(assignment: AssignmentDetails, testData: {total_tests: number; passed_tests: number}) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL + `turnTaskIn&assignment_id=${assignment.id}`;
        let res = await fetch(requestURL, {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data));
    }

    public async getSecondChanceAvailableTasks(assignment: AssignmentDetails, type_id: number) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL +`getAvailableTasks&assignment_id=${assignment.id}&type_id=${type_id}`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include"
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data));
    }

    public async getUsedHint(assignment_id : number, taskNumber: number) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL + `getUsedHint&assignment_id=${assignment_id}&task_number=${taskNumber}`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include",
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data)); 
    }

    public async getPreviousPoints(assignment_id : number, taskNumber: number) : Promise<ServerResponse> {
        let requestURL = this.BASE_URL + `getTaskPreviousPoints&assignment_id=${assignment_id}&task_number=${taskNumber}`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include",
        });
        let data = await res.json();
        return Promise.resolve(this.mapResponse(data)); 
    }

    public async getStudentData(assignments: Assignment[], powerupTypes: PowerupType[], taskRequirement: number) : Promise<StudentData> {
        let requestURL = this.BASE_URL +`getStudentData`;
        let res = await fetch(requestURL, {
            method: "GET",
            credentials: "include"
        });
        let _data = await res.json();
        if(_data.success) {
            let data = _data.data;
        
            let studentData: StudentData = {
                student: data.student,
                tokens: data.tokens,
                points: this.mapPoints(data),
                unusedPowerups: this.mapUnusedPowerupData(data.powerups, powerupTypes),
                assignmentsData: await this.mapAssignmentDetails(data, assignments, powerupTypes, taskRequirement)
            }
            return Promise.resolve(studentData);
        }
        else throw _data.message;
    }

    private mapPoints(data: any): number {
        let points = 0;
        data.assignmentPoints.forEach( (x: any) => {
            points += x.points;
        });
        return points;
    }

    private mapUsedPowerupData(data: any, powerupTypes: PowerupType[], _assignment_id: number): UsedPowerup[] {
        let _used : UsedPowerup[] = [];
        if(data.length == 0) return [];
        for(const {type_id, used, assignment_id, task_number} of data) {    
            let typeData = powerupTypes.find( (x) => { return x.id == type_id});  
            if(typeData && used && _assignment_id == assignment_id) {
                _used.push({name: typeData?.name, taskNumber: task_number});
            }
        }
        return _used;
    }

    private mapUnusedPowerupData(data: any, powerupTypes: PowerupType[]) {
        let _unused : {name: string, amount: number}[] = [];
        if(data.length == 0) return [];
        for(const {type_id, used} of data) {    
            let typeData = powerupTypes.find( (x) => { return x.id == type_id});  
            if(typeData && !used) {
                let index = _unused.findIndex((x)=>{ return x.name == typeData?.name})
                if( index == -1)
                    _unused.push({name: typeData.name, amount: 1});
                else _unused[index].amount += 1;
            }
        }
        return _unused;
    }
   
    private async mapAssignmentDetails(data : any, assignmentsData: Assignment[], powerupTypes: PowerupType[], taskRequirement: number): Promise<AssignmentDetails[]> {
        let assignments: AssignmentDetails[] = [];
        assignmentsData = assignmentsData.filter( (x) => { return x.active;});
        for(const assignment of assignmentsData) {
            let index = data.assignmentProgress.findIndex( (x: any) => { return x.assignment_id == assignment.id; } );
            if(index != -1) {
                let _index = data.currentTasks.findIndex( (x: any) => { return x.assignment_id == assignment.id; } );
                let _pIndex = data.assignmentPoints.findIndex( (x: any) => { return x.assignment_id == assignment.id; });
                let _ffIndex = data.completedTasks.findIndex( (x: any) => { return x.assignment_id == assignment.id; });
                let _tiIndex = data.turnedInTasks.findIndex( (x: any) => { return x.assignment_id == assignment.id; });
                let powerupsUsedData = this.mapUsedPowerupData(data.powerups, powerupTypes, assignment.id);
                let hint = "";
                let previousPoints = -1;
                if(_index != -1) {
                    let _tnIndex = powerupsUsedData.findIndex( (x: any) => { return x.name == 'Hint' && x.taskNumber == data.currentTasks[_index].task_number });
                    if(_tnIndex != -1) {
                        let hintResponse = await this.getUsedHint(assignment.id, data.currentTasks[_index].task_number);
                        if(hintResponse.success) 
                            hint = hintResponse.data.hint;
                        else throw hintResponse.message;
                    }
                    let _scIndex = powerupsUsedData.findIndex( (x: any) => { return x.name == 'Second Chance' && x.taskNumber == data.currentTasks[_index].task_number });
                    if(_scIndex != -1) {
                        let previousPointsResponse = await this.getPreviousPoints(assignment.id, data.currentTasks[_index].task_number);
                        if(previousPointsResponse.success)
                            previousPoints = previousPointsResponse.data.points;
                        else throw previousPointsResponse.message;
                    }
                }
                let _assignmentDetails : AssignmentDetails = {
                    id: assignment.id,
                    name: assignment.name,
                    path: assignment.path,
                    unlocked: true,
                    started: true,
                    finished: data.assignmentProgress[index].status == "Completed",
                    tasksFullyFinished: (_ffIndex != -1) ? parseInt(data.completedTasks[_ffIndex].completed) : 0,
                    tasksTurnedIn: (_tiIndex != -1) ? parseInt(data.turnedInTasks[_tiIndex].turned_in) : 0,
                    previousPoints: previousPoints,
                    points: (_pIndex != -1) ? data.assignmentPoints[_pIndex].points : 0,
                    currentTask: (_index == -1) ? {name:"Loading", taskNumber: -1} : {
                        name: data.currentTasks[_index].task_name,
                        taskNumber: data.currentTasks[_index].task_number
                    },
                    taskHint: hint,
                    buyingPowerUp: false,
                    powerupsUsed : powerupsUsedData,
                    collapsed: false
                }
                assignments.push(_assignmentDetails);
            } else {
                let _assignmentDetails : AssignmentDetails = {
                    id: assignment.id,
                    name: assignment.name,
                    path: assignment.path,
                    unlocked: false,
                    started: false,
                    finished: false,
                    tasksFullyFinished: 0,
                    tasksTurnedIn: 0,
                    previousPoints: -1,
                    points: 0,
                    currentTask: {name:"Loading", taskNumber: -1},
                    taskHint: "",
                    buyingPowerUp: false,
                    powerupsUsed: [],
                    collapsed: false
                }
                assignments.push(_assignmentDetails);
            }
        }
        assignments[0].unlocked = true;
        for(let i=1;i<assignments.length;i++)
            assignments[i].unlocked = (assignments[i-1].tasksFullyFinished >= taskRequirement);
        assignments.sort( (a,b) => a.id - b.id );
        return assignments;
    }

}
