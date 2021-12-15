const { ObjectId } = require("mongodb");

class SearchPipelineHelper {
    constructor(searchTerm) {
        this.pipeline = [
            { $match: {tableName:{$regex:'.*' + searchTerm + '.*', $options: 'i'}}},
            { $unwind: "$authors" },
            { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
            { $project: {
              tableId: { $toString: "$_id" },
              tableName: '$tableName',
              authorId: { $toString: "$authors._id" },
              authorName: "$authors.authorName",
              versionId: { $toString: "$authors.versions._id" },
              versionNumber: '$authors.versions.versionNumber',
              scores: '$authors.versions.scores',
              _id: 0
            }},
            { $sort: { tableName: 1, authorName: -1, versionNumber: -1 } }
          ];
    }
}

class SearchScorePipelineHelper {
  constructor(id) {
    this.pipeline = [
      { $unwind: "$authors" },
      { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
      { $unwind: { "path": "$authors.versions.scores", "preserveNullAndEmptyArrays": true } },
      { $project: {
        tableId: '$_id',
        tableName: '$tableName',
        authorId: '$authors._id',
        authorName: "$authors.authorName",
        versionId: '$authors.versions._id',
        versionNumber: '$authors.versions.versionNumber',
        tableUrl: '$authors.versions.versionUrl',
        scoreId: '$authors.versions.scores._id',
        userName: '$authors.versions.scores.username',
        score: '$authors.versions.scores.score',
        posted: '$authors.versions.scores.createdAt',
        postUrl: '$authors.versions.scores.postUrl',
        _id: 0
      }},
      { $match: {
        "$expr": {
          "$or": [
            { "$eq": ["$scoreId", ObjectId(id)] },
            { "$eq": ["$versionId", ObjectId(id)] },
            { "$eq": ["$authorId", ObjectId(id)] }
          ]
        },
      }}
    ];
  }
}

class AllPipelineHelper {
  constructor() {
      this.pipeline = [
          { $unwind: "$authors" },
          { $unwind: { "path": "$authors.versions", "preserveNullAndEmptyArrays": true } },
          { $project: {
            tableId: { $toString: "$_id" },
            tableName: '$tableName',
            authorId: { $toString: "$authors._id" },
            authorName: "$authors.authorName",
            versionId: { $toString: "$authors.versions._id" },
            versionNumber: '$authors.versions.versionNumber',
            scores: '$authors.versions.scores',
            _id: 0
          }},
          { $sort: { tableName: 1, authorName: -1, versionNumber: -1 } }
      ];
  }
}

module.exports = { SearchPipelineHelper, SearchScorePipelineHelper, AllPipelineHelper  }