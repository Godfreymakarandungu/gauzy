import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ICandidateInterview, Candidate } from '@gauzy/models';
import { CandidateInterviewersService } from '../../../@core/services/candidate-interviewers.service';
import { EmployeesService } from '../../../@core/services';
import { CandidateInterviewService } from '../../../@core/services/candidate-interview.service';
import { CandidatesService } from '../../../@core/services/candidates.service';
import { TranslationBaseComponent } from '../../language-base/translation-base.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
	selector: 'ngx-candidate-interview-info',
	templateUrl: './candidate-interview-info.component.html',
	styleUrls: ['./candidate-interview-info.component.scss']
})
export class CandidateInterviewInfoComponent extends TranslationBaseComponent
	implements OnInit {
	@Input() interviewId: any; //from calendar
	@Input() interviewList: ICandidateInterview[]; //from profile
	@Input() selectedCandidate: Candidate; //from profile
	candidateId: string;
	interviewerNames = [];
	currentInterview: ICandidateInterview;
	nameList: string;
	timeUpdate: string;
	isNextBtn = true;
	index = 1;
	isPreviousBtn = false;
	constructor(
		protected dialogRef: NbDialogRef<CandidateInterviewInfoComponent>,
		private candidateInterviewersService: CandidateInterviewersService,
		private employeesService: EmployeesService,
		private candidatesService: CandidatesService,
		readonly translateService: TranslateService,
		private candidateInterviewService: CandidateInterviewService
	) {
		super(translateService);
	}
	closeDialog() {
		this.dialogRef.close();
	}

	async ngOnInit() {
		if (this.interviewId) {
			const res = await this.candidateInterviewService.findById(
				this.interviewId
			);
			if (res) {
				this.interviewList = [];
				this.interviewList.push(res);

				const candidate = await this.candidatesService.getCandidateById(
					res.candidateId,
					['user']
				);
				this.selectedCandidate = candidate;
			}
		}
		this.currentInterview = this.interviewList[0];
		this.getData(this.currentInterview.id);
		this.setTime(this.currentInterview.updatedAt);
	}

	async getData(id: string) {
		this.interviewerNames = [];
		const res = await this.candidateInterviewersService.findByInterviewId(
			id
		);
		if (res) {
			for (const interview of res) {
				const employee = await this.employeesService.getEmployeeById(
					interview.employeeId,
					['user']
				);
				if (employee) {
					this.interviewerNames.push(
						employee.user.firstName + ' ' + employee.user.lastName
					);
					this.nameList = this.interviewerNames.join(', ');
				}
			}
		}
	}
	previous() {
		--this.index;
		this.isNextBtn = true;
		const currentIndex = this.interviewList.indexOf(this.currentInterview);
		const newIndex = currentIndex === 0 ? currentIndex : currentIndex - 1;
		this.currentInterview = this.interviewList[newIndex];
		this.getData(this.currentInterview.id);
		this.setTime(this.currentInterview.updatedAt);
		if (currentIndex === 1) {
			this.isPreviousBtn = false;
		}
	}
	next() {
		++this.index;
		this.isPreviousBtn = true;
		const currentIndex = this.interviewList.indexOf(this.currentInterview);
		const newIndex =
			currentIndex === this.interviewList.length - 1
				? currentIndex
				: currentIndex + 1;
		this.currentInterview = this.interviewList[newIndex];
		this.getData(this.currentInterview.id);
		this.setTime(this.currentInterview.updatedAt);
		if (currentIndex === this.interviewList.length - 2) {
			this.isNextBtn = false;
		}
	}

	setTime(time: any) {
		const now = new Date().getTime();
		const delta = (now - new Date(time).getTime()) / 1000;
		if (delta < 60) {
			this.timeUpdate = this.getTranslation(
				'CANDIDATES_PAGE.INTERVIEW_INFO_MODAL.LESS_MINUTE'
			);
		} else if (delta < 3600) {
			this.timeUpdate =
				Math.floor(delta / 60) +
				this.getTranslation(
					'CANDIDATES_PAGE.INTERVIEW_INFO_MODAL.MINUTES_AGO'
				);
		} else if (delta < 86400) {
			this.timeUpdate =
				Math.floor(delta / 3600) +
				this.getTranslation(
					'CANDIDATES_PAGE.INTERVIEW_INFO_MODAL.HOURS_AGO'
				);
		} else {
			this.timeUpdate =
				Math.floor(delta / 86400) +
				this.getTranslation(
					'CANDIDATES_PAGE.INTERVIEW_INFO_MODAL.DAYS_AGO'
				);
		}
	}
}
