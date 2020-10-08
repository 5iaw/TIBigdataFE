import { Component, Input, Output, OnInit , EventEmitter} from '@angular/core';

@Component({
  selector: 'app-search-result-filter',
  templateUrl: './search-result-filter.component.html',
  styleUrls: ['./search-result-filter.component.less']
})
export class SearchResultFilterComponent implements OnInit {

  public topics =["전체", "정치", "경제", "사회", "문화", "국제", "지역", "스포츠"];


  public sValue;


  constructor() { }

  ngOnInit() {
  }

  @Output() dateChange= new EventEmitter();
  @Input()
  get date() {
    return this.sValue;
  }

  set date(val){
    this.sValue=val;
    this.dateChange.emit(this.sValue);
  }

}
