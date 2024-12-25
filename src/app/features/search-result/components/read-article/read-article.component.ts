import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from "@angular/core";
import { CloudData } from "angular-tag-cloud-module";
import { Observable } from 'rxjs';
import { Article } from "src/app/core/models/article.model";
import { AnalysisDatabaseService } from "src/app/core/services/analysis-database-service/analysis.database.service";
import { ArticleService } from "src/app/core/services/article-service/article.service";
import { ElasticsearchService } from "src/app/core/services/elasticsearch-service/elasticsearch.service";
import { IpService } from 'src/app/core/services/ip-service/ip.service';
import { WordcloudService } from "src/app/core/services/wordcloud-service/wordcloud.service";

@Component({
  selector: "app-read-article",
  templateUrl: "./read-article.component.html",
  styleUrls: ["./read-article.component.less"],
})
export class ReadArticle implements OnInit {
  private _article: Article;
  private _cloudData: CloudData[];
  private _isRelatedLoaded = 0;
  private _isCloudLoaded = 0;
  private _isDocInfoLoaded = 0;
  private _rcmdList: Array<string>;
  private _RelatedDocBtnToggle: boolean = false;
  private transferMessage: string = '';

  private baseUrl = this.ipService.getMiddlewareServerIp() + "/file";
  private transferUrl = this.ipService.getMiddlewareServerIp() + "/es";
  private analysis_url = this.ipService.getMiddlewareServerIp() + "/input_livy";

  constructor(
    private articleService: ArticleService,
    private wordcloudService: WordcloudService,
    private elasticsearchService: ElasticsearchService,
    private analysisDatabaseService: AnalysisDatabaseService,
    private ipService: IpService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.load_new_document();
  }

  goToDoc(r) {
    this.articleService.setSelectedHashKey(this.rcmdList[r]["id"]);
    this.load_new_document();
  }
  transferEsToHDFS(esId: string, owner: string, path: string): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "application/json");
    const payload = {
      es_id: esId,
      owner: owner,
      path: path,
    };

    return this.http.post(`${this.baseUrl}/transfer`, payload, {
      headers,
      withCredentials: true, // Enable credentials for CORS
    });
  }

  transferToHDFS(articleId: string): void {
    const owner = localStorage.getItem('user_id'); // Replace with your logic for user ID retrieval
    const path = `/users/${owner}/personal_files`;

    if (!owner) {
      this.transferMessage = 'User not logged in.';
      return;
    }

    this.transferEsToHDFS(articleId, owner, path)
      .subscribe(
        (response) => {
          if (response.success) {
            this.transferMessage = `Successfully transferred article ${articleId} to HDFS.`;
          } else {
            this.transferMessage = `Error: ${response.message}`;
          }
        },
        (error) => {
          this.transferMessage = 'Failed to transfer article to HDFS.';
          console.error('Transfer error:', error);
        }
      );
  }
  /**
   * @description Load new document for related documents
   */
  async load_new_document() {
    // this.isLoaded = 0;
    this.isRelatedLoaded = 0;
    this.isCloudLoaded = 0;
    this.isDocInfoLoaded = 0;

    let hashKey = this.articleService.getSelectedHashKey();
    this.elasticsearchService.setHashKeys([hashKey]);

    this.analysisDatabaseService.loadRelatedDocs(hashKey).then((res) => {
      this.rcmdList = res as [];
      this.isRelatedLoaded++;
    });

    await this.elasticsearchService.searchByHashKey().then((res) => {
      this.article = res["hits"]["hits"][0]["_source"];
      this.isDocInfoLoaded++;
    });

    this.wordcloudService.createCloud(hashKey).then((data) => {
      this.cloudData = data as CloudData[];
      this.isCloudLoaded++;
    });
  }

  /**
   * @description Check if the data is empty
   * @param data
   */
  isDataEmpty(data: any) {
    if (data === undefined || data === null || data === " ") return true;
    else return false;
  }

  // getters and setters
  public get article(): Article {
    return this._article;
  }
  public set article(value: Article) {
    this._article = value;
  }
  public get cloudData(): CloudData[] {
    return this._cloudData;
  }
  public set cloudData(value: CloudData[]) {
    this._cloudData = value;
  }
  public get isRelatedLoaded() {
    return this._isRelatedLoaded;
  }
  public set isRelatedLoaded(value) {
    this._isRelatedLoaded = value;
  }
  public get isCloudLoaded() {
    return this._isCloudLoaded;
  }
  public set isCloudLoaded(value) {
    this._isCloudLoaded = value;
  }
  public get isDocInfoLoaded() {
    return this._isDocInfoLoaded;
  }
  public set isDocInfoLoaded(value) {
    this._isDocInfoLoaded = value;
  }
  public get rcmdList(): Array<string> {
    return this._rcmdList;
  }
  public set rcmdList(value: Array<string>) {
    this._rcmdList = value;
  }
  public get RelatedDocBtnToggle(): boolean {
    return this._RelatedDocBtnToggle;
  }
  public set RelatedDocBtnToggle(value: boolean) {
    this._RelatedDocBtnToggle = value;
  }
}
