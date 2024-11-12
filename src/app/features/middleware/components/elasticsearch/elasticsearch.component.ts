import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';

import { interval } from 'rxjs';
import { concatMap, takeWhile, switchMap, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-search',
  templateUrl: './elasticsearch.component.html',
  styleUrls: ['../../middleware-style.less'],
})

export class ElasticSearchComponent {
    searchQuery: string;
    connectionStatus: string = 'Checking connection...';

    private middlewareUrl = 'http://localhost:10000/spark'; 

    constructor(private http: HttpClient) { }

    testConnection(): void {
        const testUrl = `${this.middlewareUrl}/test-connection`;
        this.http.get(testUrl).subscribe(
          () => {
            console.log('Connection to middleware successful');
            this.connectionStatus = 'Connected to middleware';
          },
          (error) => {
            console.error('Unable to connect to middleware:', error);
            this.connectionStatus = 'Failed to connect to middleware';
          }
        );
    }

    
}