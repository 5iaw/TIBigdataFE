import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-connection",
  templateUrl: "./connection.component.html",
  styleUrls: ["./connection.component.less"],
})
export class ConnectionComponent implements OnInit {
  keyword: string = ""; // Holds the input keyword
  searchResults: any[] = []; // Holds the search results

  private _title: string = "";
  private _currentMenu: string = "";
  constructor(private router: Router) {}

  ngOnInit(): void {
    let url = this.router.url.split("/");
    console.log("URL: ", url);
    this.currentMenu = url[url.length - 1];
    this.setTitle(this.currentMenu);
  }

  selectedStyleObject(flag: boolean): Object {
    if (matchMedia("(max-width: 425px)").matches) {
      if (flag) {
        return {
          "font-weight": "bold",
          "border-bottom": "0.2rem solid #0FBAFF",
        };
      } else {
        return {
          color: "#898C8D",
          "background-color": "white",
        };
      }
    } else {
      if (flag) {
        return {
          color: "#0FBAFF",
          "font-weight": "bold",
        };
      } else {
        return {
          color: "black",
          "background-color": "white",
        };
      }
    }
  }
  /**
   * @description Set title according to current address
   * @param currentAddress
   */
  setTitle(currentAddress: string) {
    if (currentAddress === "fileupload") this.title = "File Upload";
    if (currentAddress === "search") this.title = "Search Menu";
    if (currentAddress === "analysis") this.title = "Analysis Menu";
  }

  toFileList() {
    this.router.navigateByUrl("/middleware/file-list");
    this.ngOnInit();
  }

  toElasticSearch() {
    this.router.navigateByUrl("/middleware/search");
    this.ngOnInit();
  }

  toAnalysis() {
    this.router.navigateByUrl("/middleware/analysis");
    this.ngOnInit();
  }

  public get currentMenu(): string {
    return this._currentMenu;
  }
  public set currentMenu(value: string) {
    this._currentMenu = value;
  }
  public get title(): string {
    return this._title;
  }
  public set title(value: string) {
    this._title = value;
  }

  // constructor(private http: HttpClient) {}

  // onSearch() {
  //   console.log('Search initiated with keyword:', this.keyword);

  //   if (!this.keyword.trim()) {
  //     alert('Please enter a keyword!');
  //     return;
  //   }

  // Update the URL with the full address of your middleware
  // const middlewareUrl = 'http://localhost:10000/esQueryTest';

  // // Send the keyword to the backend
  // this.http.post<any>(middlewareUrl, { keyword: this.keyword }).subscribe(
  //   (response) => {
  //     console.log('Search response received:', response);
  //     if (response && response.results) {
  //       this.searchResults = response.results;  // Assume response contains 'results' field

  //       // this.searchResults.forEach(result => {
  //       //   console.log('Document ID:', result._id);
  //       //   console.log('Document Data:', result.source);
  //       // });
  //     } else {
  //       this.searchResults = [];  // No results found
  //     }
  //   },
  //   (error) => {
  //     console.error('Error:', error);
  //     alert('An error occurred while fetching data.');
  //   }
  // );
  // }
}
