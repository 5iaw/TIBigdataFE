import {Injectable} from '@angular/core';
import * as elasticsearch from 'elasticsearch-browser';
import {Client} from 'elasticsearch-browser';
import {BehaviorSubject, Observable} from 'rxjs';
import {SearchMode} from 'src/app/core/enums/search-mode';
import {SortOption} from 'src/app/core/enums/serch-result-sort-option';
import {ArticleSource} from 'src/app/core/models/article.model';
import {IpService} from 'src/app/core/services/ip-service/ip.service';
import {ElasticSearchQueryModel} from '../../models/elasticsearch.service.query.model';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { QueryResponse } from "../../models/query.response.model";

@Injectable({
  providedIn: "root",
})

/**
 * ElasticsearchService takes control of seding and getting query to ElasticSearch server. All articles used in our web-service are get by this service.
 */
export class ElasticsearchService {
  private client: Client;
  private articleSource: BehaviorSubject<ArticleSource[]> = new BehaviorSubject<ArticleSource[]>(undefined);
  private articleNum: BehaviorSubject<number> = new BehaviorSubject<any>(0);
  private keyword: string = "";
  private selectedInst: string;
  private hashKeys: string[] = [];
  private sortOption: SortOption = SortOption.SCORE;
  private numDocsPerPage: number = 10;
  private searchMode: SearchMode;
  private searchStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private currentSearchingPage: number = 1;

  //new
  private startDate: string = "0001-01-01";
  private endDate: string = "9000-12-31";
  private mustKeyword: string = "";
  private mustNotKeyword: string = "";
  private firstChar = "";
  private topic:string = "";
  private topicHashKeys : string[] = [];
  private doctype: string = null;

  private middleware_URL = this.ipService.getMiddlewareServerIp();


  constructor(
    private ipService: IpService,
    private http: HttpClient,
    private esQueryModel: ElasticSearchQueryModel,
  ) {
    this.resetSearchFilterValue();
    // if (!this.client) {
    //   this._connect();
    // }
  }
  

  resetSearchFilterValue() {

  }

  async postDataToFlask(route:string, data: any): Promise<any> {
        
    let res: QueryResponse = await this.http
        .post<any>(this.middleware_URL+route, data, {'headers':{'Content-Type': 'application/json'}})
        .toPromise();

        if(res == undefined) {
            // alert('내부적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요!');
            return null;
        }

    return res;
}

async getDataFromFlask(route: string): Promise<any> {
    const url = `${this.middleware_URL}${route}`; // Use your middleware URL dynamically
    console.log("Fetching data from", url);
  
    try {
      const data = await this.http.get<any>(url).toPromise();
      if (!data) {
        console.error("No data received from the server.");
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error fetching data from Flask:", error);
      throw error;
    }
  }

  /**
   * @description Search articles with keyword. Set search mode and search keyword, then run searching logic.
   * @param keyword
   */
  searchKeyword(keyword: string): void {
    this.searchMode = SearchMode.KEYWORD;
    this.setKeyword(keyword);
    this.triggerSearch(1);
  }

  /**
   * @description Get current search mode.
   * @returns Current search mode.
   */
  getSearchMode(): SearchMode {
    return this.searchMode;
  }

  /**
   * @description Update current search mode.
   * @param searchMode
   */
  setSearchMode(searchMode: SearchMode): void {
    this.searchMode = searchMode;
  }

  /**
   * @description Get observable of articleNum.
   * @returns Observalbe of articleNum.
   */
  getArticleNumChange(): Observable<number> {
    return this.articleNum.asObservable();
  }

  /**
   * @description Update article numbers and send the data to all subscribers.
   * @param num
   */
  setArticleNumChange(num: number): void {
    this.articleNum.next(num);
  }

  /**
   * @description Get article source as BehaviorSubject for subscription.
   * @returns Current article source
   */
  getArticleChange(): BehaviorSubject<ArticleSource[]> {
    return this.articleSource;
  }

  /**
   * @description Update search keyword
   * @param keyword
   */
  setKeyword(keyword: string): void {
    this.esQueryModel.setSearchKeyword(keyword);
    this.keyword = keyword;
  }

  /**
   * @description Return current search keyword
   * @returns Value of current search keyword
   */
  getKeyword(): string {
    return this.keyword;
  }

  /**
   * @description Update status of searching and send the data to all subscribers.
   * @param isSearchDone the status of searching
   */
  setSearchStatus(isSearchDone: boolean): void {
    this.searchStatus.next(isSearchDone);
  }

  /**
   * @description Get status of searching as obervable.
   * @returns observable of isSearchDone
   */
  getSearchStatus(): Observable<boolean> {
    return this.searchStatus.asObservable();
  }

  /**
   * @description Update article hashKeys to search
   * @param hashKeys
   */
  setHashKeys(hashKeys: string[]): void {
    this.hashKeys = hashKeys;
    this.esQueryModel.setSearchHashKeys(this.hashKeys);
  }

  /**s
   * @description Send query to get information of Search history
   * @param string: index name => search_log-<year>.<month>
   */
  async getSearchHistory(): Promise<any> {
    const data = {
      body: {
            query: {
              match: {
                search_word: this.getKeyword(),
              },
            },
          }
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/count', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.count({
    //   index: index,
    //   body: {
    //     query: {
    //       match: {
    //         search_word: this.getKeyword(),
    //       },
    //     },
    //   }
    // });
  }

  /**
   * @description Send query to get information of all articles exist in backend database.
   * @param startIndex A index to indicate where to start search.
   * @param docSize Number of articles to search at one time.
   */
  async searchAllDocs(startIndex?: number, docSize?: number): Promise<any> {
    if (!startIndex) startIndex = 0;
    if (!docSize) docSize = this.numDocsPerPage;

    const data = {
      body: this.esQueryModel.getAllDocs(),
      from: startIndex,
      size: docSize,
      filterPath: this.esQueryModel.getFilterPath(),
      _source: this.esQueryModel.getSearchSource()
    };
  
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchAllDocs:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   body: this.esQueryModel.getAllDocs(),
    //   from: startIndex,
    //   size: docSize,
    //   filterPath: this.esQueryModel.getFilterPath(),
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  /**
   * @description Save search result after searching. This function works as a wrapper to call function of sending query and save the responded data into article source.
   * @param startIndex A index to indicate where to start search.
   */
  allSearchComplete(startIndex?: number): void {
    this.saveSearchResult(this.searchAllDocs(startIndex));
  }

  /**
   * @description Save search result after searching. This function works as a wrapper to call function of sending query and save the responded data into article source.
   * @param startIndex A index to indicate where to start search.
   * @param docSize Number of articles to search at one time.
   */
  fullTextSearchComplete(startIndex?: number, docSize?: number): void {
    if (startIndex < 0) startIndex = 0;
    this.saveSearchResult(this.searchByText(startIndex, docSize));
  }

  /**
   * @description Send query to get information of articles that match with saved search keyword.
   * @param startIndex A index to indicate where to start search.
   * @param docSize Number of articles to search at one time.
   */
  async searchByText(startIndex?: number, docSize?: number): Promise<any> {
    if (!startIndex) startIndex = 0;
    if (!docSize) docSize = this.numDocsPerPage;

    const data = {
      body: this.esQueryModel.getSearchDocs(),
      from: startIndex,
      size: docSize,
      filterPath: this.esQueryModel.getFilterPath(),
      _source: this.esQueryModel.getSearchSource()
    };
  
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByText:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   from: startIndex,
    //   size: docSize,
    //   filterPath: this.esQueryModel.getFilterPath(),
    //   body: this.esQueryModel.getSearchDocs(),
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  /**
   * @description Get number of articles in backend database.
   * @returns Response of query.
   */
  async countAllDocs(): Promise<any> {
    const data = {
      body: this.esQueryModel.getAllDocs(),
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/count', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return await this.client.count({
    //   index: this.ipSvc.ES_INDEX,
    //   body: this.esQueryModel.getAllDocs(),
    // });
  }

  /**
   * @description Update number of articles for all subscribers.
   */
  allCountComplete(): void {
    this.countAllDocs().then((articleNum) => {
      this.articleNum.next(articleNum.count);
    });
  }

  /**
   * @description Update number of articles that mathces with search keyword.
   * @returns query result
   */
  async countByText(): Promise<any> {
    const data = {
      body: this.esQueryModel.getSearchDocCount(),
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/count', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.count({
    //   index: this.ipSvc.ES_INDEX,
    //   body: this.esQueryModel.getSearchDocCount(),
    // });
  }

  async countByFilter(): Promise<any> {
    const data = {
      body: this.getSearchCountFilterQuery(),
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/count', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.count({
    //   index: this.ipSvc.ES_INDEX,
    //   body: this.getSearchCountFilterQuery(),
    // });
  }

  async countByLibrary(): Promise<any> {
    const data = {
      body: {
        query: {
          bool: {
            must: [
              this.getHashKeyQuery(),
              this.getInstQuery(),
              this.getDictionaryQuery(),
            ]
          }
        },
      }
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/count', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.count({
    //   index: this.ipSvc.ES_INDEX,
    //   body: {
    //     query: {
    //       bool: {
    //         must: [
    //           this.getHashKeyQuery(),
    //           this.getInstQuery(),
    //           this.getDictionaryQuery(),
    //         ]
    //       }
    //     },
    //   }
    // });
  }

  /**
   * @description Update number of articles for all subscribers.
   */
  countByTextComplete(): void {
    this.countByText().then((articleNum) =>
      this.articleNum.next(articleNum.count)
    );
  }

  countByFilterComplete(): void {
    this.countByFilter().then((articleNum) =>
      this.articleNum.next(articleNum.count)
    );
  }

  countByBarComplete(): void {
    this.countByFilter().then((articleNum) =>
      this.articleNum.next(articleNum.count)
    );
  }

  countByLibraryComplete(): void {
    this.countByLibrary().then((articleNum) =>
      this.articleNum.next(articleNum.count)
    );
  }

  /**
   * @description Update number of articles that mathces with list of hashKeys.
   * @returns query result
   */
  async countByHashKeys(): Promise<any> {
    const data = {
      body: this.esQueryModel.getSearchHashKeys(),
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/count', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.count({
    //   index: this.ipSvc.ES_INDEX,
    //   body: this.esQueryModel.getSearchHashKeys(),
    // });
  }

  /**
   * @description Update number of articles for all subscribers.
   */
  countByHashKeysComplete(): void {
    this.countByHashKeys().then((articleNum) =>
      this.articleNum.next(articleNum.count)
    );
  }

  /**
   * @description Send query to ElasticSearch with article hashKeys
   */
  async searchByHashKey(): Promise<any> {
    const data = {
      body: this.esQueryModel.getSearchHashKeys(),
      filterPath: this.esQueryModel.getFilterPath(),
      _source: this.esQueryModel.getSearchSource()
    };
  
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   filterPath: this.esQueryModel.getFilterPath(),
    //   body: this.esQueryModel.getSearchHashKeys(),
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  /**
   * @description Save search result after searching. This function works as a wrapper to call function of sending query and save the responded data into article source.
   * @param startIndex
   */
  multiHashKeySearchComplete(startIndex?: number): void {

    this.saveSearchResult(this.searchByManyHashKey(startIndex));
  }

  /**
   * @description Send query to ElasticSearch with article hashKeys
   * @param startIndex A index to indicate where to start search.
   * @param docSize Number of articles to search at one time.
   */
  async searchByManyHashKey(startIndex?: number): Promise<any> {
    const data = {
      body: this.esQueryModel.getSearchHashKeys(),
      size: this.esQueryModel.getSearchHashKeys().query.terms.hash_key.length,
      filterPath: this.esQueryModel.getFilterPath(),
      _source: this.esQueryModel.getSearchSource()
    };
  
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   size: this.esQueryModel.getSearchHashKeys().query.terms.hash_key.length,
    //   body: this.esQueryModel.getSearchHashKeys(),
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  /**
   * @description Based on query logiv passed to this function, this function reads the result of the query and save the article data into articleSource data.
   * @param queryFunc Function that holds query for ElasticSearch.
   */
  async saveSearchResult(queryFunc: any): Promise<void> {
    await queryFunc.then((response) => {
      if (response.hits.total.value === 0) this.docsToArticleSource(null);
      else this.docsToArticleSource(response.hits.hits);
    });
  }

  /**
   * @description Update articleSource and send data to all subscribers.
   * @param info New article source to update.
   */
  docsToArticleSource(info: Array<ArticleSource>): void {
    this.articleSource.next(info);
  }

  /**
   * @description Get number of article displays on one page
   * @returns Value of numDocPerPage.
   */
  getNumDocsPerPage(): number {
    return this.numDocsPerPage;
  }

  /**
   * @description Update number of article displays on one page.
   * @param num Number of documents to display on page.
   */
  setNumDocsPerPage(num: number) {
    this.numDocsPerPage = num;
  }

  /**
   * @description Start searching process depends on the search mode.
   * @param selectedPageNum A page to display.
   */
  triggerSearch(selectedPageNum: number): void {
    this.esQueryModel.setSortOption(this.sortOption);
    let searchMode = this.getSearchMode();
    this.setCurrentSearchingPage(selectedPageNum);

    if (searchMode === SearchMode.ALL) {
      this.allSearchComplete((selectedPageNum - 1) * this.getNumDocsPerPage());
      this.allCountComplete();
    } else if (searchMode === SearchMode.HASHKEYS) {
      this.multiHashKeySearchComplete(
        (selectedPageNum - 1) * this.getNumDocsPerPage()
      );
      this.countByHashKeysComplete();
    } else if (searchMode === SearchMode.KEYWORD) {
      this.fullTextSearchComplete(
        (selectedPageNum - 1) * this.getNumDocsPerPage()
      );
      this.countByTextComplete();
    } else if (searchMode === SearchMode.INST) {
      this.searchByInstComplete(
        (selectedPageNum - 1) * this.getNumDocsPerPage()
      );
      this.countByInstComplete();
    } else if (searchMode === SearchMode.FILTER) {
      this.searchBySearchFilterComplete(
        (selectedPageNum - 1) * this.getNumDocsPerPage()
      );
      this.countByFilterComplete();
    } else if (searchMode === SearchMode.LIBRARY) {
      this.searchByLibraryComplete(
        (selectedPageNum - 1) * this.getNumDocsPerPage()
      );
      this.countByLibraryComplete();
    }
  }

  searchBySearchFilterComplete(startIndex?: number) {
    if (startIndex < 0) startIndex = 0;
    this.saveSearchResult(this.triggerSearchFilter(startIndex));
  }

  async triggerSearchFilter(startIndex?: number, docSize?: number): Promise<void> {
    // console.log("--------es start---------")
    // console.log(this.startDate)
    // console.log(this.endDate)
    // console.log(this.selectedInst)
    // console.log(this.hashKeys.length)
    // console.log(this.mustKeyword)
    // console.log(this.mustNotKeyword)
    // console.log(this.keyword)
    // console.log(this.doctype)
    // console.log("--------es end---------")

    if (!startIndex) startIndex = 0;
    if (!docSize) docSize = this.numDocsPerPage;

    const data = {
      from: startIndex,
      size: docSize,
      filterPath: this.esQueryModel.getFilterPath(),
      body: this.getSearchFilterQuery(),
      _source: this.esQueryModel.getSearchSource()
    };
  
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   from: startIndex,
    //   size: docSize,
    //   filterPath: this.esQueryModel.getFilterPath(),
    //   body: this.getSearchFilterQuery(),
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  getSearchCountFilterQuery(){
    return {
      query: {
        bool: {
          must : this.getKeywordQuery(),
          filter: {
            bool: {
              must: [
                this.getHashKeyQuery(),
                this.getInstQuery(),
                this.getDateQuery(),
                this.getKeywordOption(),
                this.getDoctypeQuery(),
              ]
            }
          }
        }
      },
    };
  }

  getSearchFilterQuery(){
    return {
      query: {
        bool: {
          must : this.getKeywordQuery(),
          filter: {
            bool: {
              must: [
                this.getHashKeyQuery(),
                this.getInstQuery(),
                this.getDateQuery(),
                this.getKeywordOption(),
                this.getDoctypeQuery(),
              ]
            }
          }
        }
      },
      sort: [this.esQueryModel.getSortOption()],
    };
  }


  getKeywordOption(){
    if(this.mustKeyword == "") {
      return {
        bool: {
          must_not:
            {
              multi_match: {
                query: this.mustNotKeyword,
                fields: ["post_title", "file_extracted_content", "post_body"],
              }
            }
        }
      };
    }
    else{
      return {
        bool: {
          must:
            {
              multi_match: {
                query: this.mustKeyword,
                fields: ["post_title", "file_extracted_content", "post_body"],
              }
            },
          must_not:
            {
              multi_match: {
                query: this.mustNotKeyword,
                fields: ["post_title", "file_extracted_content", "post_body"],
              }
            }
        }
      };
    }
  }

  getInstQuery(){
    if(this.selectedInst == "" || this.selectedInst == null){
      return {
        bool: {
          must: {
            exists: {
              field: "published_institution"
            }
          }
        }
      };
    }else{
      return {
        match_phrase: {
          published_institution : this.selectedInst
        }
      };
    }
  }

  getHashKeyQuery(){
    if(this.topicHashKeys.length == 0){
      return {
        bool: {
          must: {
            exists: {
              field: "hash_key"
            }
          }
        }
      };
    }else{
      return {
        terms: {
          hash_key: this.topicHashKeys
        }
      };
    }
  }

  getDoctypeQuery(){
    if(this.doctype == null || this.doctype == ""){
      return {
        bool: {
          must: {
            exists: {
              field: "doc_type"
            }
          }
        }
      };
    }else{
      return {
        match: {
          doc_type: this.doctype
        }
      };
    }
  }

  getDateQuery(){
    return {
      bool: {
        should: [
          {
            range: {
              post_date: {
                gte: this.startDate,
                lt: this.endDate,
                format: "yyyy-MM-dd"
              }
            },
          },
          {
            bool: {
              must_not: {
                exists: {
                  field: "post_date"
                }
              }
            }
          }
        ]
      }
    };
  }

  getKeywordQuery(){
    return {
      multi_match: {
        query: this.keyword,
        fields: ["post_title", "file_extracted_content", "post_body"],
      },
    };
  }

  /**
   * @description Update current search page number
   * @param pageNum
   */
  setCurrentSearchingPage(pageNum: number): void {
    this.currentSearchingPage = pageNum;
  }

  /**
   * @description get current search page number
   * @returns value of currentSearchingPage
   */
  getCurrentSearchingPage(): number {
    return this.currentSearchingPage;
  }

  /**
   * @description Update current sort option.
   * @param op sort option to update
   */
  setSortOption(op: SortOption): void {
    this.sortOption = op;
  }

  /**
   * TODO: move this query structure into EsQueryModel
   * @description Send query of keyword search that use published_institution field as a filter.
   * @returns query response
   */
  async getInstitutionsWithTextSearch(): Promise<any> {
    const data = {
      body: {
        size: 0,
        aggs: {
          count: { terms: {
            field: "published_institution.keyword",
              size: 20
          } },
        },
        query: {
          multi_match: {
            query: this.keyword,
            fields: ["post_title", "file_extracted_content", "post_body"],
          },
        },
      }
    };
  
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return await this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   body: {
    //     size: 0,
    //     aggs: {
    //       count: { terms: {
    //         field: "published_institution.keyword",
    //           size: 20
    //       } },
    //     },
    //     query: {
    //       multi_match: {
    //         query: this.keyword,
    //         fields: ["post_title", "file_extracted_content", "post_body"],
    //       },
    //     },
    //   },
    // });
  }

  async getDoctypeWithTextSearch(): Promise<any> {
    const data = {
      body: {
        aggs: {
          count: {
            terms: {
              field: "doc_type.keyword",
            } },
        },
        query: {
          bool: {
            must : this.getKeywordQuery(),
            filter: {
              bool: {
                must: [
                  this.getHashKeyQuery(),
                  this.getInstQuery(),
                  this.getDateQuery(),
                  this.getKeywordOption(),
                  this.getDoctypeQuery(),
                ]
              }
            }
          }
        }
      }
    };

    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return await this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   body: {
    //     aggs: {
    //       count: {
    //         terms: {
    //           field: "doc_type.keyword",
    //         } },
    //     },
    //     query: {
    //       bool: {
    //         must : this.getKeywordQuery(),
    //         filter: {
    //           bool: {
    //             must: [
    //               this.getHashKeyQuery(),
    //               this.getInstQuery(),
    //               this.getDateQuery(),
    //               this.getKeywordOption(),
    //               this.getDoctypeQuery(),
    //             ]
    //           }
    //         }
    //       }
    //     },
    //   },
    // });
  }

  async getInstitutionsNum() {
    const data = {
      body: {
        size: 0,
        aggs: {
          unique_institutions: {
            cardinality: {
              field: "published_institution.keyword",
            }
          }
        }
      }
    };
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return await this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   body: {
    //     size: 0,
    //     aggs: {
    //       unique_institutions: {
    //         cardinality: {
    //           field: "published_institution.keyword",
    //         }
    //       },
    //     },
    //   },
    // });
  }

  /**
   * @description Send query of getting all published_institution field value and number of articles for each of the value.
   * @returns query response
   */
  async getInstitutions(numInstit?: number): Promise<any> {
    const data = {
      body: {
        size: 0,
        aggs: {
          count: { terms: {
            field: "published_institution.keyword",
            size: numInstit
          } },
        },
      },
    };
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    
    // return await this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   body: {
    //     size: 0,
    //     aggs: {
    //       count: { terms: {
    //         field: "published_institution.keyword",
    //         size: numInstit
    //       } },
    //     },
    //   },
    // });
  }

  /**
   * @description Send query of getting articles that are published from selected institution.
   * @param startIndex A index to indicate where to start search.
   */
  async searchByInst(startIndex?: number): Promise<any> {
    const data = {
      from: startIndex,
      size: this.numDocsPerPage,
      body: {
        query: {
          match: {
            published_institution: this.selectedInst,
          },
        },
      },
      _source: this.esQueryModel.getSearchSource(),
    };
    
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   from: startIndex,
    //   size: this.numDocsPerPage,
    //   body: {
    //     query: {
    //       match: {
    //         published_institution: this.selectedInst,
    //       },
    //     },
    //   },
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  getDictionaryQuery(){
    if(this.firstChar == "" || this.firstChar == null){
      return {
        bool: {
          must: {
            exists: {
              field: "first_char_title"
            }
          }
        }
      };
    }else{
      return {
        match_phrase: {
          first_char_title : this.firstChar,
        }
      };
    }
  }

  async searchByLibrary(startIndex?: number, docSize?: number): Promise<any> {
    if (!startIndex) startIndex = 0;
    
    const data = {
      from: startIndex,
      size: this.numDocsPerPage,
      body: {
        query: {
          bool: {
            must: [
              this.getDoctypeQuery(),
              this.getHashKeyQuery(),
              this.getInstQuery(),
              this.getDictionaryQuery(),
            ]
          }
        },
        sort: [this.esQueryModel.getSortOption()],
      },
      _source: this.esQueryModel.getSearchSource(),
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   from: startIndex,
    //   size: this.numDocsPerPage,
    //   body: {
    //     query: {
    //       bool: {
    //         must: [
    //           this.getDoctypeQuery(),
    //           this.getHashKeyQuery(),
    //           this.getInstQuery(),
    //           this.getDictionaryQuery(),
    //         ]
    //       }
    //     },
    //     sort: [this.esQueryModel.getSortOption()],
    //   },
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  /**
   * @description Save search result after searching. This function works as a wrapper to call function of sending query and save the responded data into article source.
   * @param startIndex
   */
  searchByInstComplete(startIndex?: number) {
    this.saveSearchResult(this.searchByInst(startIndex));
  }

  /**
   * @description Update number of articles for all subscribers.
   */
  countByInstComplete(): void {
    this.countByInst().then((articleNum) => {
      this.articleNum.next(articleNum.count);
    });
  }

  /**
   * @description Send query of getting number of documents published by selected institution.
   * @returns query response
   */
  async countByInst(): Promise<any> {
    
    const data = {
      body: {
        query: {
          match: {
            published_institution: this.selectedInst,
          },
        },
      },
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/count', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByHashKey:', error);
      throw error; // Propagate the error if needed
    }
    // return await this.client.count({
    //   index: this.ipSvc.ES_INDEX,
    //   body: {
    //     query: {
    //       match: {
    //         published_institution: this.selectedInst,
    //       },
    //     },
    //   },
    // });
  }

  /**
   * @description Update number of articles for subscribers
   * @param num
   */
  setArticleNum(num: number) {
    this.articleNum.next(num);
  }

  /**
   * @description Update selected institution.
   * @param inst
   */
  setSelectedInst(inst: string) {
    this.selectedInst = inst;
  }

  getSelectedInst():string{
    return this.selectedInst;
  }

  /**
   * @description create connection of client and Elasticsearch in backend server.
   */
  // private _connect() {
  //   this.client = new elasticsearch.Client({
  //     host: [
  //       {
  //         host: this.ipSvc.getBackEndServerIp(),
  //         auth: this.ipSvc.getESAuth(),
  //         protocol: "https",
  //         port: this.ipSvc.ES_PORT,
  //         index: this.ipSvc.ES_INDEX,
  //       },
  //     ],
  //     headers: {
  //       "Access-Control-Allow-Origin":
  //         this.ipSvc.getFrontEndServerIP() + this.ipSvc.getAngularPort(),
  //     },
  //   });
  // }

  /**
   * @description: Send ping to Elasticsearch server to check the server is alive
   * @returns If the ping success, return the result, it the ping is failed return false.
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Send the request to the Flask middleware
      let res = await this.getDataFromFlask('/es/ping');
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in ping:', error);
      throw error; // Propagate the error if needed
    }
    // try {
    //   return await this.client.ping({
    //     index: this.ipSvc.ES_INDEX,
    //     requestTimeout: 3000,
    //     body: "ElasticSearch Works!",
    //   });
    // } catch (error) {
    //   return false;
    // }
  }

  //new
  setSelectedDate(startTime: string, endTime: string) {
    this.startDate = startTime;
    this.endDate = endTime;
  }

  setDoctype(doctype: string){
    this.doctype = doctype;
  }

  getDoctype(): string{
    return this.doctype;
  }

  searchByDateComplete(startIndex?: number) {
    this.saveSearchResult(this.searchByDate(startIndex));
  }

  async searchByDate(startIndex?: number): Promise<any> {
    const data = {
      from: startIndex,
      size: this.numDocsPerPage,
      body: {
        query: {
          range: {
            post_date: {
              gt: this.startDate,
              lt: this.endDate,
              format: "yyyy-MM-dd"
            }
          },
        },
      },
      _source: this.esQueryModel.getSearchSource(),
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByDate:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   from: startIndex,
    //   size: this.numDocsPerPage,
    //   body: {
    //     query: {
    //       range: {
    //         post_date: {
    //           gt: this.startDate,
    //           lt: this.endDate,
    //           format: "yyyy-MM-dd"
    //         }
    //       },
    //     },
    //   },
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  setSelectedKeyword(mustKeyword: string, mustNotKeyword: string){
    this.mustKeyword = mustKeyword;
    this.mustNotKeyword = mustNotKeyword;
  }

  getSelectedKeyword(){
    return this.mustKeyword, this.mustNotKeyword;
  }

  fullTextOptionSearchComplete(startIndex?: number, docSize?: number): void {
    if (startIndex < 0) startIndex = 0;
    this.saveSearchResult(this.searchByTextOption(startIndex, docSize));
  }

  async searchByTextOption(startIndex?: number, docSize?: number): Promise<any> {
    if (!startIndex) startIndex = 0;
    if (!docSize) docSize = this.numDocsPerPage;

    const data = {
      from: startIndex,
      size: docSize,
      filterPath: this.esQueryModel.getFilterPath(),
      body: {
        post_filter: {
          bool: {
            must:
              {
                multi_match: {
                  query: this.mustKeyword,
                  fields: ["post_title", "file_extracted_content", "post_body"],
                }
              },
            must_not:
              {
                multi_match: {
                  query: this.mustNotKeyword,
                  fields: ["post_title", "file_extracted_content", "post_body"],
                }
              }
          }
        },
      },
      _source: this.esQueryModel.getSearchSource(),
    }
    try {
      // Send the request to the Flask middleware
      let res = await this.postDataToFlask('/es/search', data);
      return res; // Return the response from Flask
    } catch (error) {
      console.error('Error in searchByDate:', error);
      throw error; // Propagate the error if needed
    }
    // return this.client.search({
    //   index: this.ipSvc.ES_INDEX,
    //   from: startIndex,
    //   size: docSize,
    //   filterPath: this.esQueryModel.getFilterPath(),
    //   body: {
    //     post_filter: {
    //       bool: {
    //         must:
    //           {
    //             multi_match: {
    //               query: this.mustKeyword,
    //               fields: ["post_title", "file_extracted_content", "post_body"],
    //             }
    //           },
    //         must_not:
    //           {
    //             multi_match: {
    //               query: this.mustNotKeyword,
    //               fields: ["post_title", "file_extracted_content", "post_body"],
    //             }
    //           }
    //       }
    //     },
    //   },
    //   _source: this.esQueryModel.getSearchSource(),
    // });
  }

  setFirstChar(firstChar: string) {
    this.firstChar = firstChar;
  }

  getFirstChar():string{
    return this.firstChar;
  }

  searchByLibraryComplete(startIndex?: number) {
    this.saveSearchResult(this.searchByLibrary(startIndex));
  }

  setTopicHashKeys(hashKeys: string[]): void {
    this.topicHashKeys = hashKeys;
  }

  setTopic(topic: string){
    this.topic = topic;
  }

  getTopic():string{
    return this.topic
  }
}

